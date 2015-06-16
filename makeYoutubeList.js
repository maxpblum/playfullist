var tag = document.createElement('script');

tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

function onYouTubeIframeAPIReady() {
  window.lp = new ListPlayer();
}

function ListPlayer(parent) {
  var listPlayer = this;

  this.parent = parent;

  this.onPlayerReady = function(event) {
    listPlayer.playerPanel.scrollIntoView();
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
        position: 'absolute',
        width: '640px',
        height: '397px', // Video + controls
        display: 'block',
        top: '0px',
        right: '0px',
        zIndex: 100,
        backgroundColor: 'rgba(0, 0, 0, 0.47)'
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
    leftButton.onclick = listPlayer.playPrev.bind(listPlayer);

    var rightButton = this.getButton("&#x23E9;", controls);
    rightButton.style.right = '20%';
    rightButton.onclick = listPlayer.playNext.bind(listPlayer);
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
    this.play(this.index);
  };

  this.index = 0;

  this.play = function(index) {
    var videoElements = document.getElementsByClassName('youtube-player');
    if (index >= 0 && index < videoElements.length) {
      var video = videoElements[index];
      video.scrollIntoView();

      this.prepareContainer();
      var player = new YT.Player('list-player', {
        videoId: video.src.split('embed/')[1].split('?')[0],
        autoplay: 1,
        events: {
          'onReady': listPlayer.onPlayerReady,
          'onStateChange': function(event) {
            if (event.data === 0) {
              listPlayer.playNext();
            }
          }
        }
      });
    }
  };

  this.playNext = function() {
    listPlayer.play(++listPlayer.index);
  };

  this.playPrev = function() {
    listPlayer.play(--listPlayer.index);
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
