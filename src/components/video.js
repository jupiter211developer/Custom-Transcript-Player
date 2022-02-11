import React, { Component } from 'react'
import './video.css'
import CueList from './CueList'

class Video extends Component {
  constructor (props) {
    super(props)

    // this.videoRef = React.createRef()
    this.trackRef = React.createRef()

    this.video = null
    this.playbackIcons = null
    this.playButton = null
    this.videoControls = null
    this.timeElapsed = null
    this.duration = null
    this.progressBar = null
    this.seek = null
    this.seekTooltip = null
    this.volumeButton = null
    this.volumeIcons = null
    this.volumeMute = null
    this.volumeLow = null
    this.volumeHigh = null
    this.volume = null
    this.playbackAnimation = null
    // this.fullscreenButton = null
    this.videoContainer = null
    // this.fullscreenIcons = null
    // this.pipButton = null
    this.speedButton = null

    this.state = {
      cueList: null,
      speed: 1
    }
  }

  _createAndUpdateTracks (event = {}) {
    let tracks = []

    for (let i = 0; i < this.trackRef.current.track.cues.length; i++) {
      let active = false

      if (this.trackRef.current.track.activeCues.length > 0) {
        active = (this.trackRef.current.track.cues[i].text === this.trackRef.current.track.activeCues[0].text
          && this.trackRef.current.track.cues[i].startTime === this.trackRef.current.track.activeCues[0].startTime
        )
      }

      tracks.push(<span key={i} className={active ? 'active' : null}>{this.trackRef.current.track.cues[i].text + ' '}</span>)
    }

    this.setState({
      cueList: tracks
    })
  }

  // shouldComponentUpdate(nextProps, nextState) {
  //   if (nextState.speed != this.state.speed) {
  //     return true
  //   }
  //   // console.log('shouldComponentUpdate')
  //   return false
  // }

  componentDidMount () {
    // Get a string list of the entire track and render it.
    this.trackRef.current.addEventListener('cuechange', (e) => this._createAndUpdateTracks(e))

    // This is a hack to get the WebVTT to display before the video plays.
    this.trackRef.current.track.mode = 'showing'

    // this.videoRef.current.currentTime = '0.01'

    this._createAndUpdateTracks()
    this.video = document.getElementById('video')
    this.playbackIcons = document.querySelectorAll('.playback-icons use')
    this.playButton = document.getElementById('play')
    this.videoControls = document.getElementById('video-controls')
    this.timeElapsed = document.getElementById('time-elapsed')
    this.duration = document.getElementById('duration')
    this.progressBar = document.getElementById('progress-bar')
    this.seek = document.getElementById('seek')
    this.seekTooltip = document.getElementById('seek-tooltip')
    this.volumeButton = document.getElementById('volume-button')
    this.volumeIcons = document.querySelectorAll('.volume-button use')
    this.volumeMute = document.querySelector('use[href="#volume-mute"]')
    this.volumeLow = document.querySelector('use[href="#volume-low"]')
    this.volumeHigh = document.querySelector('use[href="#volume-high"]')
    this.volume = document.getElementById('volume')
    this.playbackAnimation = document.getElementById('playback-animation')
    // this.fullscreenButton = document.getElementById('fullscreen-button')
    this.videoContainer = document.getElementById('video-container')
    // this.fullscreenIcons = this.fullscreenButton.querySelectorAll('use')
    // this.pipButton = document.getElementById('pip-button')
    this.speedButton = document.getElementById('speed-button')

    this.playButton.addEventListener('click', (e) => this.togglePlay(e))
    this.video.addEventListener('play', (e) => this.updatePlayButton(e))
    this.video.addEventListener('pause', (e) => this.updatePlayButton(e))
    this.video.addEventListener('loadedmetadata', (e) => this.initializeVideo(e))
    this.video.addEventListener('timeupdate', (e) => this.updateTimeElapsed(e))
    this.video.addEventListener('timeupdate', (e) => this.updateProgress(e))
    this.video.addEventListener('volumechange', (e) => this.updateVolumeIcon(e))
    this.video.addEventListener('click', (e) => this.togglePlay(e))
    this.video.addEventListener('click', (e) => this.animatePlayback(e))
    this.video.addEventListener('mouseenter', (e) => this.showControls(e))
    // video.addEventListener('mouseleave', hideControls);
    this.videoControls.addEventListener('mouseenter', (e) => this.showControls(e))
    // videoControls.addEventListener('mouseleave', hideControls);
    this.seek.addEventListener('mousemove', (e) => this.updateSeekTooltip(e))
    this.seek.addEventListener('input', (e) => this.skipAhead(e))
    this.volume.addEventListener('input', (e) => this.updateVolume(e))
    this.volumeButton.addEventListener('click', (e) => this.toggleMute(e))
    // this.fullscreenButton.addEventListener('click', (e) => this.toggleFullScreen(e))
    // this.videoContainer.addEventListener('fullscreenchange', (e) => this.updateFullscreenButton(e))
    // this.pipButton.addEventListener('click', (e) => this.togglePip(e))
    this.speedButton.addEventListener('click', (e) => this.toggleSpeed(e))

    document.addEventListener('DOMContentLoaded', () => {
      if (!('pictureInPictureEnabled' in document)) {
        // this.pipButton.classList.add('hidden')
      }
    })
    document.addEventListener('keyup', (e) => this.keyboardShortcuts(e))

  }

  componentDidUpdate() {
    this.seek.value = Math.floor(this.video.currentTime)
  }

  togglePlay() {
    // const video = this.videoRef.current
    if (this.video.paused || this.video.ended) {
      this.video.play()
    } else {
      this.video.pause()
    }
  }

  updatePlayButton() {
    // const video = this.videoRef.current
    this.playbackIcons.forEach((icon) => icon.classList.toggle('hidden'))

    if (this.video.paused) {
      this.playButton.setAttribute('data-title', 'Play (k)')
    } else {
      this.playButton.setAttribute('data-title', 'Pause (k)')
    }
  }

  formatTime(timeInSeconds) {
    const result = new Date(timeInSeconds * 1000).toISOString().substr(11, 8)
  
    return {
      minutes: result.substr(3, 2),
      seconds: result.substr(6, 2),
    }
  }

  // initializeVideo sets the video duration, and maximum value of the
  // progressBar
  initializeVideo() {
    // const video = this.videoRef.current
    const videoDuration = Math.round(this.video.duration)
    this.seek.setAttribute('max', videoDuration)
    this.progressBar.setAttribute('max', videoDuration)
    const time = this.formatTime(videoDuration)
    this.duration.innerText = `${time.minutes}:${time.seconds}`
    this.duration.setAttribute('datetime', `${time.minutes}m ${time.seconds}s`)
  }

  // updateTimeElapsed indicates how far through the video
  // the current playback is by updating the timeElapsed element
  updateTimeElapsed() {
    const time = this.formatTime(Math.round(this.video.currentTime));
    this.timeElapsed.innerText = `${time.minutes}:${time.seconds}`;
    this.timeElapsed.setAttribute('datetime', `${time.minutes}m ${time.seconds}s`);
  }

  // updateProgress indicates how far through the video
  // the current playback is by updating the progress bar
  updateProgress() {
    this.seek.value = Math.floor(this.video.currentTime)
    this.progressBar.value = Math.floor(this.video.currentTime)
  }

  // updateSeekTooltip uses the position of the mouse on the progress bar to
  // roughly work out what point in the video the user will skip to if
  // the progress bar is clicked at that point
  updateSeekTooltip(event) {
    const skipTo = Math.round(
      (event.offsetX / event.target.clientWidth) *
        parseInt(event.target.getAttribute('max'), 10)
    )
    this.seek.setAttribute('data-seek', skipTo)
    const t = this.formatTime(skipTo)
    this.seekTooltip.textContent = `${t.minutes}:${t.seconds}`
    const rect = this.video.getBoundingClientRect()
    // this.seekTooltip.style.left = `${event.pageX - rect.left}px`
    this.seekTooltip.style.left = `${event.pageX}px`
  }

  // skipAhead jumps to a different point in the video when the progress bar
  // is clicked
  skipAhead(event) {
    const skipTo = event.target.dataset.seek
      ? event.target.dataset.seek
      : event.target.value;
    this.video.currentTime = skipTo;
    this.progressBar.value = skipTo;
    this.seek.value = skipTo;
  }

  // updateVolume updates the video's volume
  // and disables the muted state if active
  updateVolume() {
    if (this.video.muted) {
      this.video.muted = false
    }

    this.video.volume = this.volume.value
  }

  // updateVolumeIcon updates the volume icon so that it correctly reflects
  // the volume of the video
  updateVolumeIcon() {
    this.volumeIcons.forEach((icon) => {
      icon.classList.add('hidden')
    })

    this.volumeButton.setAttribute('data-title', 'Mute (m)')

    if (this.video.muted || this.video.volume === 0) {
      this.volumeMute.classList.remove('hidden')
      this.volumeButton.setAttribute('data-title', 'Unmute (m)')
    } else if (this.video.volume > 0 && this.video.volume <= 0.5) {
      this.volumeLow.classList.remove('hidden')
    } else {
      this.volumeHigh.classList.remove('hidden')
    }
  }

  // toggleMute mutes or unmutes the video when executed
  // When the video is unmuted, the volume is returned to the value
  // it was set to before the video was muted
  toggleMute() {
    this.video.muted = !this.video.muted

    if (this.video.muted) {
      this.volume.setAttribute('data-volume', this.volume.value)
      this.volume.value = 0
    } else {
      this.volume.value = this.volume.dataset.volume
    }
  }

  // animatePlayback displays an animation when
  // the video is played or paused
  animatePlayback() {
    this.playbackAnimation.animate(
      [
        {
          opacity: 1,
          transform: 'scale(1)',
        },
        {
          opacity: 0,
          transform: 'scale(1.3)',
        },
      ],
      {
        duration: 500,
      }
    )
  }

  // toggleFullScreen toggles the full screen state of the video
  // If the browser is currently in fullscreen mode,
  // then it should exit and vice versa.
  // toggleFullScreen() {
  //   if (document.fullscreenElement) {
  //     document.exitFullscreen()
  //   } else if (document.webkitFullscreenElement) {
  //     // Need this to support Safari
  //     document.webkitExitFullscreen()
  //   } else if (this.videoContainer.webkitRequestFullscreen) {
  //     // Need this to support Safari
  //     this.videoContainer.webkitRequestFullscreen()
  //   } else {
  //     this.videoContainer.requestFullscreen()
  //   }
  // }

  // updateFullscreenButton changes the icon of the full screen button
  // and tooltip to reflect the current full screen state of the video
  // updateFullscreenButton() {
  //   this.fullscreenIcons.forEach((icon) => icon.classList.toggle('hidden'))

  //   if (document.fullscreenElement) {
  //     fullscreenButton.setAttribute('data-title', 'Exit full screen (f)')
  //   } else {
  //     fullscreenButton.setAttribute('data-title', 'Full screen (f)')
  //   }
  // }

  // togglePip toggles Picture-in-Picture mode on the video
  // async togglePip() {
  //   try {
  //     if (this.video !== document.pictureInPictureElement) {
  //       this.pipButton.disabled = true
  //       await this.video.requestPictureInPicture()
  //     } else {
  //       await document.exitPictureInPicture()
  //     }
  //   } catch (error) {
  //     console.error(error)
  //   } finally {
  //     this.pipButton.disabled = false
  //   }
  // }

  // hideControls hides the video controls when not in use
  // if the video is paused, the controls must remain visible
  hideControls() {
    if (this.video.paused) {
      return
    }

    this.videoControls.classList.add('hide')
  }

  // showControls displays the video controls
  showControls() {
    this.videoControls.classList.remove('hide')
  }

  // keyboardShortcuts executes the relevant functions for
  // each supported shortcut key
  keyboardShortcuts(event) {
    const { key } = event
    switch (key) {
      case 'k':
        this.togglePlay()
        this.animatePlayback()
        if (this.video.paused) {
          this.showControls()
        } else {
          setTimeout(() => {
            // hideControls();
          }, 2000)
        }
        break
      case 'm':
        this.toggleMute()
        break
      case 'f':
        // this.toggleFullScreen()
        break
      case 'p':
        // this.togglePip()
        break
    }
  }

  toggleSpeed() {
    let newSpeed = this.state.speed == 1 ? 2 : 1
    this.video.playbackRate = newSpeed
    console.log(newSpeed)
    this.setState({ speed: newSpeed })
  }

  render () {
    return (
      <div className='d-flex justify-content-between flex-row'>
        <div className='d-flex justify-content-between flex-column col-6 p-5'>
          {/* <p>
            {this.state.cueList}
          </p> */}
          <CueList cueList={this.state.cueList}/>
          <div className="video-controls" style={{width: '50%'}} id="video-controls">
            <div className="video-progress">
              <progress id="progress-bar" value="0" min="0"></progress>
              <input className="seek" id="seek" value="0" min="0" type="range" step="1" readOnly />
              <div className="seek-tooltip" id="seek-tooltip">00:00</div>
            </div>

            <div className="bottom-controls">
              <div className="left-controls">
                <button data-title="Play (k)" id="play">
                  <svg className="playback-icons">
                    <use href="#play-icon"></use>
                    <use className="hidden" href="#pause"></use>
                  </svg>
                </button>

                <div className="volume-controls">
                  <button data-title="Mute (m)" className="volume-button" id="volume-button">
                    <svg>
                      <use className="hidden" href="#volume-mute"></use>
                      <use className="hidden" href="#volume-low"></use>
                      <use href="#volume-high"></use>
                    </svg>
                  </button>

                  <input className="volume" id="volume" value="1" data-mute="0.5" type="range" max="1" min="0" step="0.01" readOnly />
                </div>

                <div className="time">
                  <time id="time-elapsed">00:00</time>
                  <span> / </span>
                  <time id="duration">00:00</time>
                </div>
              </div>

              <div className="right-controls">
                {/* <button data-title="PIP (p)" className="pip-button" id="pip-button">
                  <svg>
                    <use href="#pip"></use>
                  </svg>
                </button> */}
                {/* <button data-title="Full screen (f)" className="fullscreen-button" id="fullscreen-button">
                  <svg>
                    <use href="#fullscreen"></use>
                    <use href="#fullscreen-exit" className="hidden"></use>
                  </svg>
                </button> */}
                <button data-title="Speed" className="speed-button" id="speed-button">
                  <span>{ this.state.speed == 1 ? 2 : 1 }X</span>
                </button>
              </div>
            </div>
          </div>
          <svg style={{display: 'none'}}>
            <defs>
              <symbol id="pause" viewBox="0 0 24 24">
                <path d="M14.016 5.016h3.984v13.969h-3.984v-13.969zM6 18.984v-13.969h3.984v13.969h-3.984z"></path>
              </symbol>

              <symbol id="play-icon" viewBox="0 0 24 24">
                <path d="M8.016 5.016l10.969 6.984-10.969 6.984v-13.969z"></path>
              </symbol>

              <symbol id="volume-high" viewBox="0 0 24 24">
              <path d="M14.016 3.234q3.047 0.656 5.016 3.117t1.969 5.648-1.969 5.648-5.016 3.117v-2.063q2.203-0.656 3.586-2.484t1.383-4.219-1.383-4.219-3.586-2.484v-2.063zM16.5 12q0 2.813-2.484 4.031v-8.063q1.031 0.516 1.758 1.688t0.727 2.344zM3 9h3.984l5.016-5.016v16.031l-5.016-5.016h-3.984v-6z"></path>
              </symbol>

              <symbol id="volume-low" viewBox="0 0 24 24">
              <path d="M5.016 9h3.984l5.016-5.016v16.031l-5.016-5.016h-3.984v-6zM18.516 12q0 2.766-2.531 4.031v-8.063q1.031 0.516 1.781 1.711t0.75 2.32z"></path>
              </symbol>

              <symbol id="volume-mute" viewBox="0 0 24 24">
              <path d="M12 3.984v4.219l-2.109-2.109zM4.266 3l16.734 16.734-1.266 1.266-2.063-2.063q-1.547 1.313-3.656 1.828v-2.063q1.172-0.328 2.25-1.172l-4.266-4.266v6.75l-5.016-5.016h-3.984v-6h4.734l-4.734-4.734zM18.984 12q0-2.391-1.383-4.219t-3.586-2.484v-2.063q3.047 0.656 5.016 3.117t1.969 5.648q0 2.203-1.031 4.172l-1.5-1.547q0.516-1.266 0.516-2.625zM16.5 12q0 0.422-0.047 0.609l-2.438-2.438v-2.203q1.031 0.516 1.758 1.688t0.727 2.344z"></path>
              </symbol>

              {/* <symbol id="fullscreen" viewBox="0 0 24 24">
              <path d="M14.016 5.016h4.969v4.969h-1.969v-3h-3v-1.969zM17.016 17.016v-3h1.969v4.969h-4.969v-1.969h3zM5.016 9.984v-4.969h4.969v1.969h-3v3h-1.969zM6.984 14.016v3h3v1.969h-4.969v-4.969h1.969z"></path>
              </symbol> */}

              {/* <symbol id="fullscreen-exit" viewBox="0 0 24 24">
              <path d="M15.984 8.016h3v1.969h-4.969v-4.969h1.969v3zM14.016 18.984v-4.969h4.969v1.969h-3v3h-1.969zM8.016 8.016v-3h1.969v4.969h-4.969v-1.969h3zM5.016 15.984v-1.969h4.969v4.969h-1.969v-3h-3z"></path>
              </symbol> */}

              <symbol id="pip" viewBox="0 0 24 24">
              <path d="M21 19.031v-14.063h-18v14.063h18zM23.016 18.984q0 0.797-0.609 1.406t-1.406 0.609h-18q-0.797 0-1.406-0.609t-0.609-1.406v-14.016q0-0.797 0.609-1.383t1.406-0.586h18q0.797 0 1.406 0.586t0.609 1.383v14.016zM18.984 11.016v6h-7.969v-6h7.969z"></path>
              </symbol>
            </defs>
          </svg>
        </div>
        <div className='video col-6 video-container align-center' id="video-container">
          <div className="playback-animation" id="playback-animation">
            <svg className="playback-icons">
              <use className="hidden" href="#play-icon"></use>
              <use href="#pause"></use>
            </svg>
          </div>
          <video id='video' width='640' height='480' controls preload='metadata'>
            <source src={this.props.videoSrc} type={this.props.videoType} />
            <track
              kind={this.props.trackKind}
              label={this.props.trackLabel}
              srcLang={this.props.trackLang}
              src={this.props.trackSrc}
              ref={this.trackRef}
            />
          </video>
        </div>
      </div>

    )
  }
}

export default Video