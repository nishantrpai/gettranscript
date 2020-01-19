function openTranscripts() {
  let menu = document.querySelector('[aria-label="More actions"]');
  menu.click();
  setTimeout(() => {
    console.log('open transcript');
    document.querySelector('#items > ytd-menu-service-item-renderer:nth-child(2)').click();
  }, 2000);
}

function getTranscripts() {
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
    transcript.push(`${tdata[1].includes('you') ? '\n' : ''}${tdata[1]}\n`);
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

function formatText(num, comment) {
  let dashes = '';
  for (let h = 0; h < num; h++) {
    dashes += 'x';
  }
  comment = comment.replace(/\n/g, " , ");
  let commentArr = comment.split(' ');
  let count = dashes.length;
  let updatedComment = `${dashes}`;
  for (let k = 0; k < commentArr.length; k++) {
    let word = commentArr[k];

    if (count > 190 && count < 250) {
      updatedComment += `\n${dashes}`;
      count = dashes.length;
    }

    if (word == ',') {
      updatedComment += `\n${dashes}`;
    }
    else {
      updatedComment += ` ${word}`;
    }

    count += word.length + 1;
  }
  return updatedComment;
}


function getChildComment(num, transcript, elem) {
  // console.log(elem);
  // console.log(elem.querySelector('.child > .listing').children.length);
  for (let i = 0; i < elem.querySelector('.child > .listing').children.length; i++) {
    if (elem.querySelector('.child > .listing').children[i].querySelector('form')) {
      let comment = elem.querySelector('.child > .listing').children[i].querySelector('form').innerText;
      comment = formatText(num, comment);
      transcript.push(`${comment}\n\n\n`);
    }
    if (elem.querySelector('.child > .listing').children[i].querySelector('.child > .listing')) {
      getChildComment(num + 1, transcript, elem.querySelector('.child > .listing').children[i])
    }
  }
}

function redditAction() {
  console.log('initiating reddit action');
  let transcript = [];
  let title = document.querySelector('div.top-matter > p.title > a').innerText;
  let description = document.querySelector('.expando').innerText;
  let url = location.href;

  transcript.push(`${url}\n\n`);
  transcript.push(`Title: ${title}\n\n\n`);
  transcript.push('------------------------------------------------\n\n')
  transcript.push(`Description: ${description}\n\n`);

  let comments = document.querySelectorAll('.nestedlisting > .comment');

  for (let i = 0; i < comments.length; i++) {
    //all parent comments
    transcript.push('------------------------------------------------\n\n')
    let comment = comments[i].querySelector('form').innerText;
    comment = formatText(1, comment);
    transcript.push(`${comment}\n\n\n`);

    //all children comments
    if (comments[i].querySelector('.child > .listing')) {
      getChildComment(2, transcript, comments[i])
    }
  }
  saveData(transcript, `${title}.txt`);
}

chrome.runtime.onMessage.addListener(
  function (request, sender, sendResponse) {
    if (request.message === "clicked_browser_action") {
      if (location.href.includes('youtube')) {
        youtubeAction();
      } else if (location.href.includes('reddit')) {
        redditAction();
      }
    }
  }
);
