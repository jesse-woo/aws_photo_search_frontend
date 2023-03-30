// This is a working version of the frontend wihtout API keys. Roll back to this if problems
// AWS S3 Image Search
const searchForm = document.getElementById('search-form');
const searchResults = document.getElementById('search-results');
const voiceSearchBtn = document.getElementById('voice-search-btn');
const searchField = document.getElementById('search-term');

let recognition = null;

searchForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const searchTerm = document.getElementById('search-term').value;
  console.log("The searchTerm is")
  console.log(searchTerm)
  const url = `https://ph7tsuqnwf.execute-api.us-east-1.amazonaws.com/dev/search?q=${searchTerm}`;
  console.log(url)
  fetch(url)
    .then(response => response.json())
    .then(data => {
      searchResults.innerHTML = '';
      const photos = JSON.parse(data.body);
      photos.forEach(photo => {
        const img = document.createElement('img');
        const photoUrl = `https://${photo.bucket}.s3.amazonaws.com/${photo.objectKey}`;
        img.src = photoUrl;
        img.alt = photo.labels.join(', ');
        searchResults.appendChild(img);
      });
    })
    .catch(error => {
      console.error(error);
      searchResults.innerHTML = 'Error: Unable to load search results';
    });
});

// AWS S3 Image Upload
const uploadForm = document.getElementById('upload-form');
// Obviously you wouldn't want to hardcode the key like this in production
const apiKey = 'j7awLpdVApa0RGr8xNB4GkuZpSaTnV93DqR58OAf';

uploadForm.addEventListener('submit',  (event) => {
  event.preventDefault();
  // const encFileName = encodeURIComponent(fileName);
  console.log("You successfully called the put method")
  const fileInput = document.getElementById('upload-file');
  const file = fileInput.files[0];
  const encFileName = encodeURIComponent(file.name);
  console.log("The filename and type are:")
  console.log(encFileName)
  console.log(file.type)
  const labelsInput = document.getElementById('upload-labels');
  const labelsArray = labelsInput.value.split(/,\s*/).filter(label => label.trim() !== '');
  const metadata = {
    'labels': labelsArray
  };
  console.log("The labels and metadata are:")
  console.log(labelsArray)
  console.log(metadata)
  const url = `https://ph7tsuqnwf.execute-api.us-east-1.amazonaws.com/dev/upload/coms6998-hw2-jw4202-photos/${encFileName}`; 
  fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': file.type,
      'x-amz-meta-customLabels': JSON.stringify(metadata),
      'x-api-key': apiKey
    },
    body: file
  })
    .then(response => {
      if (response.ok) {
        alert('Upload Successful!');
      } else {
        alert('Upload Failed.');
      }
    })
    .catch(error => {
      console.error(error);
      alert('Upload Failed.');
    });
});

// WebSpeech API Voice Search
if ('webkitSpeechRecognition' in window) {
    
    const recognition = new webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
  
    voiceSearchBtn.addEventListener('click', () => {
      
      recognition.start();
      console.log("You are doing speech recognition")
    });

    recognition.onresult = (event) => {
      const transcript = event.results[event.results.length - 1][0].transcript.trim();
      console.log("SEARCH TERM IS:")
      console.log(transcript)
      searchField.value = transcript;
    };
  
    // recognition.onresult = (event) => {
    //   const searchTerm = event.results[0][0].transcript.trim();
    //   const inputField = document.getElementById('search-term');
    //   inputField.value = searchTerm;
    //   console.log("SEARCH TERM IS:")
    //   console.log("searchTerm")
    //   searchForm.submit();
    // };

    recognition.onerror = (event) => {
      console.error(event.error);
      alert('Error: Voice Search Failed');
    };

    recognition.onend = () => {
      console.log('Speech recognition ended');
    };

    document.getElementById('voice-stop-btn').addEventListener('click', () => {
      console.log("You clicked the stop button")
      if (recognition) {
        recognition.stop();
        console.log("recognition has stopped")
        recognition = null;
      }
    });
  } else {
    voiceSearchBtn.disabled = true;
    console.warn('Web Speech API not supported by this browser');
  }