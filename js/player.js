(function(window){
    function Player($audio){
        return new Player.prototype.init($audio);
    }
    Player.prototype={
        constructor: Player,
        musicList:[],
        init:function($audio){
            this.$audio = $audio;
            this.audio = $audio.get(0);
        },
        currentIndex:-1,
        playMusic: function(index,music){
            //判断是否是同一首音乐
            if(this.currentIndex == index){
                //同一首音乐
                if(this.audio.paused){
                    //当前为暂停
                    this.audio.play();
                }else{
                    //当前正在播放
                    this.audio.pause();
                }
            }else{
                //不是同一首歌
                this.$audio.attr("src",music.link_url);
                this.audio.play();
                this.currentIndex = index;
            }
        },
        preIndex: function(){
            var index = this.currentIndex-1;
            if(index < 0){
                index = this.musicList.length-1;
            }
            return index;
        },
        nextIndex: function(){
            var index = this.currentIndex+1 ;
            if(index > this.musicList.length-1){
                index = 0;
            }
            return index;
        },
        changeMusic: function(index){
            //删除对应元素
            this.musicList.splice(index,1);
            //判断当前删除的是否是正在播放音乐的前面的音乐
            if(index < this.currentIndex){
                this.currentIndex = this.currentIndex - 1; 
            }
        },
        musicTimeUpdate: function(callBack){
            var $this = this;
            //监听播放的进度
		    this.$audio.on("timeupdate",function(){
                var duration = $this.audio.duration;
                var currentTime = $this.audio.currentTime;
                var timeStr = $this.formatDate(currentTime,duration);
                // $(".music_progress_time").text(timeStr);
                callBack(currentTime, duration, timeStr);
            });
        },
        formatDate: function(currentTime,duration){
            //后时间
            var endMin = parseInt(duration / 60);
            var endSec = parseInt(duration % 60);
            if(endMin < 10){
                endMin = "0" + endMin;
            }
            if(endSec < 10){
                endSec = "0" + endSec;
            }

            //前时间
            var startMin = parseInt(currentTime / 60);
            var startSec = parseInt(currentTime % 60);
            if(startMin < 10){
                startMin = "0" + startMin;
            }
            if(startSec < 10){
                startSec = "0" + startSec;
            }
            return startMin+":"+startSec+" / "+endMin+":"+endSec;
        
        },
        musicSeekTo: function(value){
            if(isNaN(value)) return;
            this.audio.currentTime = this.audio.duration * value;
            
        },
        musicVoiceSeekTo: function(value){
            if(isNaN(value)) return;
            if(value < 0 || value > 1) return;
            this.audio.volume = value;

        }
    }
    Player.prototype.init.prototype = Player.prototype;
    window.Player=Player;
})(window)