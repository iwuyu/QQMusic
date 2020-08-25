(function(window){
    function Lyrics(path){
        return new Lyrics.prototype.init(path);
    }
    Lyrics.prototype={
        constructor: Lyrics,
        init:function(path){
            this.path = path;
        },
        times: [],
        lyric: [],
        index: -1,
        loadLyrics: function(callBack){
            $this = this;
            $.ajax({
                url: $this.path,
                dataType: "text",
                success:function(data){
                    // console.log(data);
                    $this.parseLyrics(data);
                    callBack();
                },
                error:function(e){
                    console.log(e);
                }
                
            });
        },
        parseLyrics: function(data){
            var $this = this;
            //格式化数组列表(清空上一首歌曲的歌词和时间)
            $this.times = [];
            $this.lyric = [];
            var array = data.split("\n");
            // console.log(array);
            // [00:00.92]
            //利用正则表达式来匹配时间
            var timeReg = /\[(\d*:\d*\.\d*)\]/
            //遍历取出每一行歌词
            $.each(array,function(index, ele){
                //处理歌词
                var lrc = ele.split("]")[1];
                //排除空字符串(无歌词)
                if(lrc.length == 1) return true;
                $this.lyric.push(lrc);

                // console.log(ele);
                var res = timeReg.exec(ele);
                // console.log(res);
                if(res == null) return true;
                var timeStr = res[1];  // 00:00.92
                var res2 = timeStr.split(":");
                var min = parseInt(res2[0]) * 60;
                var sec = parseFloat(res2[1]);
                var time = parseFloat(Number(min + sec).toFixed(2));
                $this.times.push(time);
            });
            // console.log($this.times);
            // console.log($this.lyric);
        },
        currentIndex:function(currentTime){
            // console.log(currentTime); 
            if(currentTime >= this.times[0]){
                this.index++;
                this.times.shift(); //删除数组最前面的一个元素
            }
            return this.index;
        }
    }
    Lyrics.prototype.init.prototype = Lyrics.prototype;
    window.Lyrics=Lyrics;
})(window)