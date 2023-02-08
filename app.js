const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)
const PLAYER_STORAGE_KEY = 'F8_PLAYER'
const heading = $('header h2')
const cd =$('.cd')
const cdThumb = $('.cd-thumb')
const audio = $('#audio')
const playBtn = $('.btn-toggle-play')
const player = $('.player')
const progress = $('#progress')
const nextBtn = $('.btn-next')
const prevBtn= $('.btn-prev')
const randomBtn = $('.btn-random')
const repeatBtn = $('.btn-repeat')
const playList = $('.playlist')
const app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isRepeat:false,
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    setConfig: function(key,value) {
        this.config[key] = value;
        localStorage.setItem(PLAYER_STORAGE_KEY,JSON.stringify(this.config));
    },
    songs : [
        {
            name: 'Get you to the moon',
            singer: 'Kina,Snow',
            path: './music/nhac1.mp3',
            image: './img/anh1.jpg'
        },
       {
            name: 'Like Strangers Do',
            singer: 'AJ Mitchell',
            path: './music/nhac2.mp3',
            image: './img/anh2.jpg'
        },
       {
            name: 'Clound',
            singer: 'Galdive',
            path: './music/nhac3.mp3',
            image: './img/anh3.jpg'
        },
       {
            name: 'Naughty Boy',
            singer: 'La la la ft. Sam Smith',
            path: './music/nhac4.mp3',
            image: './img/anh4.jpg'
        },
       {
            name: 'Price Tag',
            singer: 'Jessie J',
            path: './music/nhac5.mp3',
            image: './img/anh5.jpg'
        }
    ],
    render: function(){
        const htmls = this.songs.map((song,index)=> {
        return `
            <div class="song ${index === this.currentIndex ? 'active': ''}" data-index="${index}">
                <div class="thumb" 
                    style="background-image: url('${song.image}')">
                </div>
                <div class="body">
                    <h3 class="title">${song.name}</h3>
                    <p class="author">${song.singer}</p>
                </div>
                <div class="option">
                    <i class="fas fa-ellipsis-h"></i>
                </div>
            </div>
            `
        })
        playList.innerHTML = htmls.join('')
    },
    defineProperties:function(){
        Object.defineProperty(this, 'currentSong',{
            get:function(){
                return this.songs[this.currentIndex]
            }
        })
    },
    loadCurrentSong:function(){
        heading.textContent = this.currentSong.name
        cdThumb.style.backgroundImage = `url(${this.currentSong.image}`
        audio.src = this.currentSong.path
    },
    nextSong:function(){
        this.currentIndex++
        if(this.currentIndex >= this.songs.length) {
            this.currentIndex = 0
        } 
        this.loadCurrentSong()
    },
    prevSong:function(){
        this.currentIndex--
        if(this.currentIndex < 0) {
            this.currentIndex = this.songs.length - 1
        } 
        this.loadCurrentSong()
    },
    playRandomSong: function() {
        let newIndex
        do{
            newIndex = Math.floor(Math.random() * this.songs.length )
        } while (newIndex === this.currentIndex)
        this.currentIndex = newIndex
        this.loadCurrentSong()
    },
    loadConfig: function() {
        this.isRandom = this.config.isRandom
        this.isRepeat = this.config.isRepeat
    },
    handleEvent:function() {
        const _this = this
        // Scroll CD zoom in & out
        const cdWidth = cd.offsetWidth
        document.onscroll = function() {
            const scrollTop = window.scrollY || document.documentElement.scrollTop
            const newCdWidth = cdWidth - scrollTop
            cd.style.width = newCdWidth > 0 ? newCdWidth + 'px': 0
            cd.style.opacity = newCdWidth/cdWidth
        }
        // Play and Pause 
        playBtn.onclick = function() {
            if(_this.isPlaying) {
                audio.pause()
            }
            else{
                audio.play()
            }
        }
        audio.onplay = function() {
            _this.isPlaying = true
            player.classList.add('playing')
            cdThumbRotate.play()
        }
        audio.onpause = function() {
            _this.isPlaying = false
            player.classList.remove('playing')
            cdThumbRotate.pause()
        }
        // Seek following playing
        audio.ontimeupdate = function() {
            if(audio.duration) {
                const progressPercent = Math.floor(audio.currentTime / audio.duration * 100)
                progress.value = progressPercent
            }
        }
        progress.onchange = function(e) {
            const seekTime  = e.target.value / 100 * audio.duration
            audio.currentTime = seekTime
        }
        // Rotate CD
       const cdThumbRotate = cdThumb.animate (
            [{transform: 'rotate(360deg)'}],
            {
                duration: 10000,
                iteration: Infinity,
            }
       )
       cdThumbRotate.pause()
        // Handle click Next song
        nextBtn.onclick = function() {
            if(_this.isRandom) {
                _this.playRandomSong()
            } else {
                _this.nextSong()
                
            }
            audio.play()
            _this.render()
            _this.scrollToActiveSong()
        }
        // Handle click Prev song
        prevBtn.onclick = function() {
            if(_this.isRandom) {
                _this.playRandomSong()
            } else {
                _this.prevSong()
            }
            audio.play()
            _this.render()
            _this.scrollToActiveSong()


        }
        // Random
        randomBtn.onclick = function() {
            _this.isRandom = !_this.isRandom
            randomBtn.classList.toggle('active',_this.isRandom)
            _this.setConfig('isRandom', _this.isRandom)
        }
        // Handle next song when audio ended
        audio.onended = function() {
            if(_this.isRepeat) {
                audio.play()
            }else{
                nextBtn.click();
            }
          
        }
        // Repeat button
        repeatBtn.onclick = function() {
            _this.isRepeat = !_this.isRepeat
            repeatBtn.classList.toggle('active',_this.isRepeat)
            _this.setConfig('isRepeat ', _this.isRepeat)
        }
        // Click on name song
        playList.onclick = function(e) {
            const songNode = e.target.closest('.song:not(.active)')
            const optionNode = e.target.closest('.option')
            if(songNode || optionNode){
                if(songNode) {
                    _this.currentIndex = Number(songNode.dataset.index)
                    _this.loadCurrentSong()
                    audio.play()
                    _this.render()
            
                }
            }
        }

    },
    scrollToActiveSong: function() {
        setTimeout(() => {
            $('.song.active').scrollIntoView({
                behavior: 'smooth',
                block: 'nearest'
            })
        },500)
    },
    start: function( ){
        // Gan cau hinh tu config vao ung dung
        this.loadConfig()
        this.render()
        this.defineProperties()
        this.loadCurrentSong()
        this.nextSong()
        this.handleEvent()
        // Hien thi trang thai ban dau cua button repeat va random
        repeatBtn.classList.toggle('active',this.isRepeat)
        randomBtn.classList.toggle('active',this.isRandom)
    }
   
}
app.start()