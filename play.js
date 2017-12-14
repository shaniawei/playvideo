$(document).ready(function() {
    var np = {};
    var video = $("#video");
    var videoDom = video[0]; //获得video的DOM对象，以便调用video的DOM对象的函数
    var bigBtn = $(".bigBtn");
    var progressBar = $(".progressBar"); //进度条外围
    var progressBarBlock = $("#progressBarBlock"); //快进按钮
    var durationTime = $("#durationTime"); //视频长度
    var playedProgressBar = $("#playedProgressBar"); //进度条 蓝色
    var currentTime = $("#currentTime"); //播放时间
    var smallBtn = $(".smallBtn");
    var voiceLine = $(".voiceLine");
    var voiceLineBlock = $("#voiceLineBlock");
    var fullScreen = $(".fullScreen").find("img").first();
    var progressBarBlockPositionLeft = progressBarBlock.position().left; //值为0
    var progressBarBlockWidth = progressBarBlock.width();
    var relProgressBarWidth = progressBar.width() - progressBarBlock.width(); //progressBar的真正宽度
    //var dur=videoDom.duration;             错误，因为此时videoDOm可能还没有加载好,onloadedmetadata
    var dur;
    var timeInterval;

    //video标签加载完成视频的元数据，就会触发这个事件
    videoDom.onloadedmetadata = function() {
        dur = videoDom.duration; //视频总长度
        var t = np.convertTime(dur);
        durationTime.text(t); //设置视频总时间
        np.changeVolumn();
    };

    //控制进度条的移动
    np.autoPlay = function() {
        if (videoDom.ended == true) {
            window.clearInterval(timeInterval);
            bigBtn.show("fast");
            playedProgressBar.width(0);
            progressBarBlock.css("left", progressBarBlockPositionLeft);
            currentTime.text("00:00:00");
            //videoDom.currenttime  这个是获取当前的播放位置，当视频播放完成后，会自动回到视频刚刚加载的时候
            return;
        }
        var perSecWidth;
        perSecWidth = relProgressBarWidth / (dur); //每秒前进多少px   可能存在零点几的误差 导致进度条走到最后的时候会没有触及尽头   没解决
        currentTime.text(np.convertTime(Math.round(videoDom.currentTime))); //videoDom.currentTime出现0.9 1.9的值 这个值如果不进行向上取值的 会默认向下取值 导致最初本应该是1s的时候出现0s
        var temp = playedProgressBar.width() + perSecWidth;
        playedProgressBar.width(temp);
        progressBarBlock.css("left", temp);
    }
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

    //暂停播放 start
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


    video.bind("click", np.playOrPaused);

    bigBtn.bind("click", np.play);

    smallBtn.click(function() {
        np.playOrPaused();
    });

    //暂停播放 end

    //进度条事件 start
    progressBar.click(function(event) {
        console.log(event.offsetX) //距离鼠标点击元素的宽度
        if (event.target.id !== 'progressBarBlock') {
            var x = event.offsetX;
            if (x <= relProgressBarWidth) {
                var currenttime = (dur / relProgressBarWidth) * x; //获得当前点击对应的时间
                var t = np.convertTime(Math.round(currenttime));
                currentTime.text(t);
                videoDom.currentTime = currenttime; //设置当前视频播放时间
                progressBarBlock.css("left", x);
                playedProgressBar.width(x);
                np.play();
            } else {
                var t = np.convertTime(Math.round(dur));
                currentTime.text(t);
                videoDom.currentTime = dur; //设置当前视频播放时间
                progressBarBlock.css("left", relProgressBarWidth);
                playedProgressBar.width(relProgressBarWidth);
                // np.play();
            }
        }


    });

    progressBarBlock.mousedown(function(event) {
        window.clearInterval(timeInterval);
        var x = event.pageX;
        var originLeft = progressBarBlock.position().left;
        var originwidth = playedProgressBar.width();
        $(document).mousemove(function(event) {
            var w = event.pageX - x;
            //防止拖到外面去
            if (progressBarBlock.position().left <= progressBarBlockPositionLeft) {
                if (w <= 0) {
                    return false;
                }
            }
            if (progressBarBlock.position().left > relProgressBarWidth) {
                if (w > 0) {
                    return false;
                }
            }
            progressBarBlock.css("left", originLeft + w);
            playedProgressBar.width(originwidth + w);

        });
        $(document).mouseup(function() {
            $(document).unbind("mousemove");
            var curT = (dur / relProgressBarWidth) * progressBarBlock.position().left;
            console.log(curT)
            if (curT >= dur) {
                bigBtn.show("fast");
                playedProgressBar.width(0);
                progressBarBlock.css("left", 0);
                currentTime.text("00:00:00");
                return false;
            }
            videoDom.currentTime = curT;
            console.log(videoDom.currentTime)
            currentTime.text(np.convertTime(Math.round(curT)));
            np.play();
            return false;
        });
        return false;
    });

    //进度条事件  end


    //调大调小声音 start
    np.changeVolumn = function() {
        var volumn = (voiceLineBlock.position().left / (voiceLine.width() - voiceLineBlock.width())) * 1; //将voiceLine元素设为BFC元素 独立于其他元素 其position值是相对于自己的值 更便于计算
        volumn = volumn > 1 ? 1 : volumn;
        volumn = volumn < 0 ? 0 : volumn;
        videoDom.volumn = volumn;
    };

    voiceLine.click(function(event) {
        // if (event.target.id !== 'voiceLineBlock') {
        var x = event.offsetX;
        voiceLineBlock.css("left", x);
        np.changeVolumn();
        // } else {
        // event.preventDefault();
        // }

    });

    voiceLineBlock.mousedown(function() {
        $(document).mousemove(function(event) {
            var x = event.offsetX;
            if (x < 0 || x > voiceLine.width()) {
                return false;
            }
            voiceLineBlock.css("left", x);
        });
        $(document).mouseup(function() {
            $(document).unbind("mousemove");
            np.changeVolumn();
        });
    });

    //调大调小声音 end

    //全屏
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