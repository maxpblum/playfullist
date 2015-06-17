chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
  if (msg.text && msg.text === 'toggle_list_player') {
    if (window.lp) {
      window.lp.close();
      delete window.lp;
    } else {
      window.lp = new window.ListPlayer();
      window.lp.open();
    }
  }
});

function ListPlayer(parent) {
  this.findVideos = function() {
    if (!listPlayer.iframeClass) {
      var iframes = document.getElementsByTagName('iframe');
      for (var i = 0; i < iframes.length; i++) {
        if (iframes[i].src && iframes[i].src.indexOf('youtube') !== -1) {
          listPlayer.iframeClass = iframes[i].class;
          break;
        }
      }
      listPlayer.iframeClass = listPlayer.iframeClass || 'youtube-player';
    }
    return document.getElementsByClassName(listPlayer.iframeClass);
  };

  this.getNext = function() {
    return listPlayer.getVideo(function(videoList, i) {
        if (videoList.length > i + 1) {
          return videoList[i + 1];
        } else {
          return;
        }
    });
  };

  this.getPrev = function() {
    return listPlayer.getVideo(function(videoList, i) {
        if (videoList.length > 1) {
          return videoList[i - 1];
        } else {
          return;
        }
    });
  }

  this.getVideo = function(getter) {
    var videos = listPlayer.findVideos();
    for (var i = 0; i < videos.length; i++) {
      if (videos[i].src.indexOf(listPlayer.currentVideoCode) !== -1) {
        return getter(videos, i);
      }
    }
    return videos[0];
  };

  this.currentVideoCode = "IHOPEINEVERFINDTHISCODEINAURL"

  var listPlayer = this;

  this.parent = parent;

  this.onPlayerReady = function(event) {
    event.target.playVideo();
  };

  this.makePlayerPanel = function(parent) {
    parent = parent || document.body;
    var existing = document.getElementById('list-player-panel');

    if (existing) {

      if (existing.parentElement === parent)
        return existing;
      throw new Error('List player panel already exists, but not in parent element ' + parent);

    } else {

      var panel = this.getStyledElement('div', parent, {
        position: 'fixed',
        width: '640px',
        height: '397px', // Video + controls
        display: 'block',
        top: '0px',
        right: '0px',
        zIndex: 100,
        backgroundColor: 'black'
      });

      this.getControls(panel);

      return panel;

    }
  };

  this.getControls = function(panel) {
    var controls = this.getStyledElement('div', panel, {
      position: 'absolute',
      width: '100%',
      height: '37px',
      display: 'block',
      bottom: '0px',
      left: '0px',
      zIndex: 101,
      backgroundColor: 'rgba(100, 100, 200, 0.5)'
    });

    var leftButton = this.getButton("&#x23EA;", controls);
    leftButton.style.left = '20%';
    leftButton.onclick = listPlayer.play.bind(listPlayer, 'prev');

    var rightButton = this.getButton("&#x23E9;", controls);
    rightButton.style.right = '20%';
    rightButton.onclick = listPlayer.play.bind(listPlayer, 'next');
  };

  this.getButton = function(content, parent) {
    var button = this.getStyledElement('button', parent, {
      backgroundColor: 'rgba(50, 255, 50, 0.65)',
      fontSize: '20px',
      padding: '6px 24px',
      cursor: 'pointer',
      position: 'absolute'
    });

    button.innerHTML = content;
    return button;
  };

  this.getStyledElement = function(tagName, parent, styleProps) {
    var elem = document.createElement(tagName);
    for (var prop in styleProps) {
      elem.style[prop] = styleProps[prop];
    }
    parent.appendChild(elem);
    return elem;
  };

  this.open = function() {
    this.playerPanel = this.makePlayerPanel(this.parent);
    this.play();
  };

  this.close = function() {
    listPlayer.playerPanel.parentElement.removeChild(listPlayer.playerPanel);
  }

  this.index = 0;

  this.play = function(direction) {
    var video = direction === 'prev' ? listPlayer.getPrev() : listPlayer.getNext();
    listPlayer.currentVideoCode = video.src.split('embed/')[1].split('?')[0];
    video.scrollIntoView();
    this.prepareContainer();

    var player = new YT.Player('list-player', {
      videoId: listPlayer.currentVideoCode,
      autoplay: 1,
      events: {
        'onReady': listPlayer.onPlayerReady,
        'onStateChange': function(event) {
          if (event.data === 0) {
            listPlayer.play('next');
          }
        }
      }
    });
  };

  this.prepareContainer = function() {
    var panel = this.playerPanel;
    var existing = document.getElementById('list-player');
    if (existing && existing.parentElement == panel)
      panel.removeChild(existing);

    listPlayer.video = this.getStyledElement('div', panel, {});
    listPlayer.video.id = 'list-player';
  }
}
