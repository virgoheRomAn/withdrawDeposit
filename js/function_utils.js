/**
 * 补零
 * @param num 补零的数字
 * @param n 补零的位数
 * @returns {String}   补零之后的字符
 */
var padZero = function (num, n) {
    var len = num.toString().length;
    while (len < n) {
        num = "0" + num;
        len++;
    }
    return num;
};
/**
 * 获取当前时间
 * @param type
 * @returns {string}
 */
var getNowTime = function (type) {
    var myDate = new Date();
    var year = myDate.getFullYear();
    var month = myDate.getMonth() + 1;
    var date = myDate.getDate();
    var h = myDate.getHours();
    var m = myDate.getMinutes();
    var s = myDate.getSeconds();

    switch (type) {
        case "timeAll":
            return padZero(h, 2) + ':' + padZero(m, 2) + ":" + padZero(s, 2);
            break;
        case "date":
            return year + '-' + padZero(month, 2) + "-" + padZero(date, 2);
            break;
        case "timeSimple":
            return padZero(h, 2) + ':' + padZero(m, 2);
            break;
        case "timeSting":
            return year + padZero(month, 2) + padZero(date, 2) + padZero(h, 2) + padZero(m, 2) + padZero(s, 2);
            break;
        default:
            return year + '-' + padZero(month, 2) + "-" + padZero(date, 2) + " " + padZero(h, 2) + ':' + padZero(m, 2) + ":" + padZero(s, 2);
            break;
    }
};

var $loading = $(".pull-loading");
var $container = $("#scroll").find("ul");
var temHtml = $("#template").html();

var myScroll = new iScroll("wrapper", {
    onScrollMove: function () {
        if (this.y < this.maxScrollY) {
            $loading.html("释放加载更多");
            $loading.addClass("loading");
        } else {
            $loading.html("可上滑查看更多");
            $loading.removeClass("loading");
        }
    },
    onScrollEnd: function () {
        if ($loading.hasClass('loading')) {
            $loading.html("加载中...");
            pullOnLoad();
        }
    },
    onRefresh: function () {
        $loading.html("可上滑查看更多");
        $loading.removeClass("loading");
    }
});


//每次加载5条
var page = 5;

function pullOnLoad() {
    setTimeout(function () {
        for (var j = 0; j < page; j++) {
            $container.append(temHtml.replace("%*time*%", getNowTime('date')).replace("%*tips*%", "至尾号2344建设银行卡").replace("%*money*%", 50 * (j + 1) + ".00元"));
        }
        myScroll.refresh();
    }, 1000);
}


