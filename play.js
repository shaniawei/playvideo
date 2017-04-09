$(document).ready(function() {
    var np = {};
    var video = $("#video");
    var videoDom = video[0]; //获得video的DOM对象，以便调用video的DOM对象的函数
    var bigBtn = $("#bigBtn");
    var progressBar = $("#progressBar");
    var progressBarBlock = $("#progressBarBlock");
    var durationTime = $("#durationTime");
    var playedProgressBar = $("#playedProgressBar");
    var currentTime = $("#currentTime");
    var smallBtn = $("#smallBtn");
    var voiceLine = $("#voiceLine");
    var voiceLineBlock = $("#voiceLineBlock");
    var fullScreen = $("#fullScreen").find("img").first();
    var progressBarBlockPositionLeft = progressBarBlock.position().left;
    var relProgressBarWidth = progressBar.width() - progressBarBlock.width(); //progressBar的真正宽度
    var progressBarBlockWidth = progressBarBlock.width();
    //var dur=videoDom.duration;             错误，因为此时videoDOm可能还没有加载好,onloadedmetadata
    var dur;
    var timeInterval;

    //控制进度条的移动
    np.autoPlay = function() {
        if (videoDom.ended == true) {
            window.clearInterval(timeInterval);
            bigBtn.show("fast");
            playedProgressBar.width(0);
            progressBarBlock.css("left", progressBarBlockPositionLeft);
            currentTime.text("00:00:00");
            //videoDom.currenttime=0;这个是设置当前的播放位置，当视频播放完成后，会自动回到视频刚刚加载的时候
            return;
        }
        var perSecWidth;
        perSecWidth = relProgressBarWidth / dur;  //每秒前进多少px
        currentTime.text(np.convertTime(videoDom.currentTime));
        //判断是否超过父容器的width
        if (playedProgressBar.width() + progressBarBlockWidth + perSecWidth > progressBar.width()) {
            progressBarBlock.css("left", progressBar.width() - progressBarBlockWidth + progressBar.position().left + 1);
            playedProgressBar.width(progressBar.width() - progressBarBlockWidth);
        } else {
            if ((progressBarBlock.position().left - playedProgressBar.position().left) < playedProgressBar.width()) {
                playedProgressBar.width(progressBarBlock.position().left - playedProgressBar.position().left);
            }
            if ((progressBarBlock.position().left - playedProgressBar.position().left) > playedProgressBar.width()) {
                playedProgressBar.width(progressBarBlock.position().left - playedProgressBar.position().left);
            }
            //调节playedProcessBar和block之间的间隙，因为perSecWidth是小数的原因
            //playedProgressBar.width(progressBarBlock.position().left - playedProgressBar.position().left);
            progressBarBlock.css("left", progressBarBlock.position().left + perSecWidth);
            if (perSecWidth < 0.5) {
                perSecWidth = 0.5;
            }
            var temp = playedProgressBar.width() + perSecWidth;
            // console.log(temp);
            // var str=temp.toString();
            // str=str.substr(str.indexOf(".")+1,1);
            // str=parseInt(str);
            // if(str>=0&&str<5){
            //   temp=Math.floor(temp)+0.5;
            // }else{
            //   temp=Math.ceil(temp);
            // }
            playedProgressBar.width(temp);

        }
    };
    np.play = function() {
        clearInterval(timeInterval);
        bigBtn.hide("fast");
        videoDom.play();   
        smallBtn.find("img").first().attr("src", "images/start.jpg");
        timeInterval = window.setInterval(np.autoPlay, 1000); //注意如果使用的是预先定义好的函数，写函数名就好
    };
    np.pause = function() {
        bigBtn.show("fast");
        videoDom.pause();
        smallBtn.find("img").first().attr("src", "images/stop.jpg");
        window.clearInterval(timeInterval);
        //设定要一个定时器，只要没有清除它，该定时器就会永远工作下去，如果前面一个定时器没有清除，
        //后面又开启一个定时器，那么就要特别小心了，特别是针对同一个功能，所以，
        //当你在设定一个新的定时器的时候不知道原来的定时器是否清除，以防万一，
        //最好在设定新的定时器之前，做一个clearInterval,就是这个定时器困了我大半天，奶奶的
    };
    np.playOrPaused = function() {
        videoDom.paused ? np.play() : np.pause();
    };
    np.convertTime = function(time) {
        var hh, mm, ss;
        var strTime = "00:00:00";
        if (time == null || time < 0) return strTime;
        hh = parseInt(time / 3600);
        ss = parseInt((time - hh * 3600) / 60);
        mm = parseInt(time - hh * 3600 - ss * 60);
        if (hh < 10) {
            hh = "0" + hh;
        }
        if (mm < 10) {
            mm = "0" + mm;
        }
        if (ss < 10) {
            ss = "0" + ss;
        }
        strTime = hh + ":" + ss + ":" + mm;
        return strTime;
    };
    //video标签加载完成视频的元数据，就会触发这个事件
    videoDom.onloadedmetadata = function() {
        dur = videoDom.duration;        //视频总长度
        var t = np.convertTime(dur);
        durationTime.text(t); //设置视频总时间
    };

    video.bind("click", np.playOrPaused);

    bigBtn.bind("click", np.play);

    progressBar.click(function(event) {
        var x = event.pageX;
        var left = progressBar.position().left + progressBarBlockWidth; //progressBar距离左边真正的距离
        var width = relProgressBarWidth;
        var durationTime = dur; //获得视频总时间
        var currenttime = (durationTime / width) * (x - left); //获得当前点击对应的时间
        videoDom.currentTime = currenttime; //设置当前视频播放时间
        progressBarBlock.css("left", progressBarBlockPositionLeft + (x - left));
        //playedProgressBar.width(x-progressBar.position().left);
        playedProgressBar.width(x - left);
        var t = np.convertTime(currenttime);
        currentTime.text(t);
    });

    progressBarBlock.mousedown(function(event) {
        window.clearInterval(timeInterval);
        var pageX = event.pageX;
        var originLeft = progressBarBlock.position().left;
        $(document).mousemove(function(event) {
            var w = event.pageX - pageX;
            if (progressBarBlock.position().left <= progressBarBlockPositionLeft) {
                if (w < 0) {
                    return false;
                }
            }
            if (playedProgressBar.width() + progressBarBlock.width() + 1 >= progressBar.width()) {
                if (w > 0) {
                    return false;
                }
            }
            progressBarBlock.css("left", originLeft + w);
            playedProgressBar.width(progressBarBlock.position().left - progressBar.position().left - 1);
        });
        $(document).mouseup(function() {
            $(document).unbind("mousemove");
            var curT = (dur / relProgressBarWidth) * (progressBarBlock.position().left - progressBar.position().left);
            if (curT >= dur) {
                bigBtn.show("fast");
                playedProgressBar.width(0);
                progressBarBlock.css("left", progressBarBlockPositionLeft);
                currentTime.text("00:00:00");
                return false;
            }
            videoDom.currentTime = curT;
            currentTime.text(np.convertTime(curT));
            np.play();
            return false;
        });
        return false;
    });

    smallBtn.click(function() {
        np.playOrPaused();
    });

    np.changeVolumn = function() {
        var volumn = ((voiceLineBlock.position().left - voiceLine.position().left) / (voiceLine.width() - voiceLineBlock.width())) * 1;
        volumn > 1 ? 1 : volumn;
        volumn < 0 ? 0 : volumn;
        videoDom.volumn = volumn;
    };

    voiceLineBlock.click(function() {
        return false;
    });

    voiceLine.click(function(event) {
        var pageX = event.pageX;
        if (pageX > voiceLine.position().left + voiceLineBlock.width()) {
            voiceLineBlock.css("left", pageX - 2 * voiceLineBlock.width());
            np.changeVolumn();
        }
    });

    voiceLineBlock.mousedown(function() {
        $(document).mousemove(function(event) {
            var pageX = event.pageX;
            if (pageX < voiceLine.position().left || pageX > voiceLine.width() + voiceLine.position().left) {
                return false;
            }
            voiceLineBlock.css("left", pageX);
        });
        $(document).mouseup(function() {
            $(document).unbind("mousemove");
            np.changeVolumn();
        });
    });

    fullScreen.click(function() {
        var pfix = ["webkit", "moz", "o", "ms", "khtml"];
        var fix = "";
        for (var i = 0; i < pfix.length; i++) {
            if (typeof document[pfix[i] + "CancelFullScreen"] != "undefined") {
                fix = pfix[i];
                break;
            }
        }
        if (fix === "") {
            alert("您的浏览器不支持全屏!");
            return false;
        }
        videoDom[fix + "RequestFullScreen"]();
    });

    np.keypress = function(event) {
        if (event.which == 32) {
            np.playOrPaused();
        }
    };
    $(document).bind("keydown", np.keypress);
});