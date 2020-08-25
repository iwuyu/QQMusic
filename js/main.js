// import { format } from "url";

$(function(){
	//自定义滚动条
	$(".content_list").mCustomScrollbar();

	var $audio = $("audio");
	var player = new Player($audio);
	var progress;
	var voiceProgress;
	var lyrics;
	

	//加载歌曲列表
	getPlayerList();
	function getPlayerList(){
		$.ajax({
			url: "./source/musiclist.json",
			dataType: "json",
			success:function(data){
				player.musicList = data;
				//通过遍历到的数据，创建每一条音乐
				//获取插入歌曲的位置
				var $musicList = $(".content_list ul");
				$.each(data,function(index,ele){
					var $item = createMusicItem(index, ele);
					$musicList.append($item);
				});
				//初始化歌曲信息
				initMusicInfo(data[0]);
				// 初始化歌词信息
				initMusicLyrics(data[0]);

			},
			error:function(e){
				console.log(e);
			}
			
		});
	}

	//初始化歌曲信息
	function initMusicInfo(music){
		//获取对应的元素
		var $musicImage = $(".song_info_pic img");
		var $musicName = $(".song_info_name a");
		var $musicSinger = $(".song_info_singer a");
		var $musicAlbum = $(".song_info_album a");
		var $musicProgressName = $(".music_progress_name");
		var $musicProgressTime = $(".music_progress_time");
		var $musicBg = $(".mask_bg");
		//给获取到的元素赋值
		$musicImage.attr("src",music.cover);
		$musicName.text(music.name);
		$musicSinger.text(music.singer);
		$musicAlbum.text(music.album);
		$musicProgressName.text(music.name+" / "+music.singer);
		$musicProgressTime.text("00:00 / "+music.time);
		$musicBg.css("background","url('"+music.cover+"')");
	}

	//初始化歌词信息
	function initMusicLyrics(music){
		lyrics = new Lyrics(music.link_lrc);
		//获取歌词列表的Dom元素
		var $lyricsContainer = $(".song_lyric");
		//清空上一首音乐的歌词
		$lyricsContainer.html("");
		lyrics.loadLyrics(function(){
			//创建歌词列表
			$.each(lyrics.lyric,function(index, ele){
				var $item = $("<li>"+ele+"</li>");
				$lyricsContainer.append($item);
			});
		});
	}

	//初始化进度条
	initProgress();
	function initProgress(){
		//音乐进度条
		var $progressBar = $(".music_progress_bar");
		var $progressLine = $(".music_progress_line");
		var $progressDot = $(".music_progress_dot");
		progress = Progress($progressBar,$progressLine,$progressDot);
		//进度条点击事件
		progress.progressClick(function(value){
			player.musicSeekTo(value);
		});
		//进度条拖拽事件
		progress.progressMove(function(value){
			player.musicSeekTo(value);
		});

		//声音进度条
		var $voiceBar = $(".music_voice_bar");
		var $voiceLine = $(".music_voice_line");
		var $voiceDot = $(".music_voice_dot");
		voiceProgress = Progress($voiceBar,$voiceLine,$voiceDot);
		//进度条点击事件
		voiceProgress.progressClick(function(value){
			player.musicVoiceSeekTo(value);
		});
		//进度条拖拽事件
		voiceProgress.progressMove(function(value){
			player.musicVoiceSeekTo(value);
		});
	}


	//初始化事件的监听
	initEvents();
	function initEvents(){
		//监听歌曲的移入移出事件
		/*移入：显示子菜单，隐藏时长*/
		$(".content_list").delegate(".list_music","mouseenter",function(){
			// 显示子菜单
			//显示播放、添加、下载、分享图标
			$(this).find(".list_menu").stop().fadeIn(0);
			//隐藏时长
			$(this).find(".list_time span").stop().fadeOut(0);
			//显示删除图标
			$(this).find(".list_time a").stop().fadeIn(0);
		});

		/*移出：隐藏子菜单，显示时长*/
		$(".content_list").delegate(".list_music","mouseleave",function(){
			//隐藏子菜单
			//隐藏播放、添加、下载、分享图标
			$(this).find(".list_menu").stop().fadeOut(0);
			//隐藏删除图标
			$(this).find(".list_time a").stop().fadeOut(0);

			//显示时长
			$(this).find(".list_time span").stop().fadeIn(0);
		});

		//监听复选框点击事件
		$(".content_list").delegate(".list_check","click",function(){
			$(this).toggleClass("list_checked");
		});

		//添加子菜单播放按钮的移入
		// $(".content_list").delegate(".list_menu_play","mouseenter",function(){
		// 	$(this).toggleClass("list_menu_play3");
		// });

		//添加子菜单播放按钮的监听
		//获取底部的播放按钮
		var $musicPlay = $(".music_play");
		$(".content_list").delegate(".list_menu_play","click",function(){
			//找到当前这首音乐的节点
			var $item = $(this).parents(".list_music");

			// console.log($item.get(0).index);
			// console.log($item.get(0).music);

			//切换播放按钮的图标
			$(this).toggleClass("list_menu_play2");
			//复原其他播放按钮的图标
			$item.siblings().find(".list_menu_play").removeClass("list_menu_play2");
			//同步底部播放按钮图标
			if($(this).attr("class").indexOf("list_menu_play2") != -1){
				//当前子菜单是播放状态
				//添加播放按钮2
				$musicPlay.addClass("music_play2");
				//让文字高亮
				$item.find("div").css("color","#fff");
				//然后其他歌曲文字变暗
				$item.siblings().find("div").css("color","rgba(255, 255, 255, .5)");
			}else{
				//当前子菜单不是播放状态
				//移出播放按钮2
				$musicPlay.removeClass("music_play2");
				//让文字不高亮
				$item.find("div").css("color","rgba(255, 255, 255, .5)");
			}
			//切换序号状态
			$item.find(".list_number").toggleClass("list_number2");
			//还原其他序号状态
			$item.siblings().find(".list_number").removeClass("list_number2");

			//播放音乐
			player.playMusic($item.get(0).index,$item.get(0).music);

			//切换歌曲信息
			initMusicInfo($item.get(0).music);
			//切换歌词信息
			initMusicLyrics($item.get(0).music);
		});

		//监听底部控制区域播放按钮的点击
		$musicPlay.click(function(){
			//判断有没有播放过音乐
			if(player.currentIndex == -1){
				//没有播放过音乐
				$(".list_music").eq(0).find(".list_menu_play").trigger("click");
			}else{
				//已经播放过音乐
				$(".list_music").eq(player.currentIndex).find(".list_menu_play").trigger("click");
			}
		});
		//监听底部控制区域上一首按钮的点击
		$(".music_pre").click(function(){
			$(".list_music").eq(player.preIndex()).find(".list_menu_play").trigger("click");
		});

		//监听底部控制区域下一首按钮的点击
		$(".music_next").click(function(){
			$(".list_music").eq(player.nextIndex()).find(".list_menu_play").trigger("click");
		});

		//监听删除按钮的点击
		$(".content_list").delegate(".list_menu_del","click",function(){
			//找到被点击的音乐
			var $item = $(this).parents(".list_music");
			//判断删除的是否是正在播放的音乐
			if($item.get(0).index == player.currentIndex){
				$(".music_next").trigger("click");
			}
			//移除节点
			$item.remove();
			//删除文件中对应的音乐
			player.changeMusic($item.get(0).index);

			//重新排序
			$(".list_music").each(function(index,ele){
				ele.index = index;
				$(ele).find(".list_number").text(index+1);
			});
		});

		//监听播放的进度
		player.musicTimeUpdate(function(currentTime, duration, timeStr){
			//同步时间
			$(".music_progress_time").text(timeStr);
			//同步进度条
			//计算播放比例
			var value = currentTime / duration * 100;
			progress.setProgress(value);
			//实现歌词的同步
			var index = lyrics.currentIndex(currentTime);
			var $item = $(".song_lyric li").eq(index);
			$item.addClass("cur");
			$item.siblings().removeClass("cur");
			//设置播放第几行后滚动
			if(index <= 2) return;
			$(".song_lyric").css({
				marginTop: (-index + 2) * 30
			});
		});

		//监听声音按钮的点击
		$(".music_voice_icon").click(function(){
			//图标的切换
			$(this).toggleClass("music_voice_icon2");
			//声音的切换
			//判断当前图标是否是静音图标
			if($(this).attr("class").indexOf("music_voice_icon2") != -1){
				//变为静音
				player.musicVoiceSeekTo(0);
			}else{
				//变为有声音
				player.musicVoiceSeekTo(1);
			}
		});
	}

	//定义一个方法，创建一条音乐
	function createMusicItem(index, music){
		var $item = $(" <li class='list_music'>"+
		"<div class='list_check'><i></i></div>"+
		"<div class='list_number'>"+(index+1)+"</div>"+
		"<div class='list_name'>"+music.name+""+
		"	<div class='list_menu'>"+
		"		<a href='javascript:;' title='播放' class='list_menu_play'></a>"+
		"		<a href='javascript:;' title='添加'></a>"+
		"		<a href='javascript:;' title='下载'></a>"+
		"		<a href='javascript:;' title='分享'></a>"+
		"	</div>"+
		"</div>"+
		"<div class='list_singer'>"+music.singer+"</div>"+
		"<div class='list_time'>"+
		"	<span>"+music.time+"</span>"+
		"	<a href='javascript:;' title='删除' class='list_menu_del'></a>"+
		"</div>"+
		"</li>");

		$item.get(0).index = index;
		$item.get(0).music = music;
		return $item;
	}
	// 监听切换模式按钮的点击
	var mode = 1;
	$(`.music_mode${mode}`).click(function(){
		//图标切换
		$(this).toggleClass(`music_mode${mode}`);
		if(mode == 4){
			mode=0;
		}
		mode++;
		$(this).toggleClass(`music_mode${mode}`);
	})

	// 监听喜欢按钮的点击
	$(".music_fav").click(function(){
		//图标切换
		$(this).toggleClass(`music_fav2`);
	})

	// 监听纯净按钮的点击
	$(".music_only").click(function(){
		//图标切换
		$(this).toggleClass(`music_only2`);
	})
});