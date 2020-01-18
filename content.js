function openTranscripts() {
  let menu = document.querySelector('[aria-label="More actions"]');
  menu.click();
  setTimeout(() => {
    console.log('open transcript');
    document.querySelector('#items > ytd-menu-service-item-renderer:nth-child(2)').click();
  }, 2000);
}

function getTranscripts() {
  console.log('getting transcripts');
  let transcripts = document.querySelectorAll('#body > ytd-transcript-body-renderer > div');
  let tsText = [];
  for (let i = 0; i < transcripts.length; i++) {
    tsText.push(transcripts[i].innerText);
  }
  return tsText;
}


var saveData = (function () {
  var a = document.createElement("a");
  document.body.appendChild(a);
  a.style = "display: none";
  return function (data, fileName) {
    blob = new Blob(data, { type: "text/plain" }),
      url = window.URL.createObjectURL(blob);
    a.href = url;
    a.download = fileName;
    a.click();
    window.URL.revokeObjectURL(url);
  };
}());


function saveTranscripts(transcriptArr) {
  let transcript = [];
  console.log('save transcripts');
  for (let i = 0; i < transcriptArr.length; i++) {
    let tdata = transcriptArr[i].split('\n');
    transcript.push(`${tdata[1]}\n${tdata[1].includes('you') ? '\n' : ''}`);
  }
  let title = document.querySelector('#container > h1 > yt-formatted-string').innerText;
  saveData(transcript, `${title}.txt`);
}

function youtubeAction() {
  console.log('initiating youtube action');
  let transcripts = getTranscripts();
  if (transcripts.length == 0) {
    openTranscripts();
    //wait 2 secs before getting the transcripts
    setTimeout(() => { this.getTranscripts().length > 0 ? this.saveTranscripts(this.getTranscripts()) : alert('no transcripts were found'); }, 8000);
  } else {
    //if the transcripts are already there, then save it
    if (transcripts.length > 0) {
      this.saveTranscripts(transcripts);
    } else {
      alert('no transcripts were found');
    }
  }

}

chrome.runtime.onMessage.addListener(
  function (request, sender, sendResponse) {
    if (request.message === "clicked_browser_action") {
      if (location.href.includes('youtube')) {
        youtubeAction();
      }
    }
  }
);
