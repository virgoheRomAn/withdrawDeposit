;(function ($, win) {
    $.jBox = function () {
        var self = this;
        //变量
        var isMobile = ("ontouchstart" in window);
        var startEvent, moveEvent, endEvent;
        var options = {};
        var _clear_setTimeout_ = 0;
        var _IMG_ = {};
        var defaultsIcon = {
            success: "jBox-success.png",
            error: "jBox-error.png",
            waring: "jBox-waring.png",
            loading: "jBox-loading.gif"
        };

        //默认全局参数
        self.defaults = {
            //模式改用自动判断
            //type: "H5",     //模式：默认：PC，可选：H5
            /**
             * 展示模式：showNumber
             * 0-透明遮罩半透明黑色
             * 1-半透明黑色遮罩，白色内容
             * 2-透明遮罩，白色内容
             * 3-没有遮罩，白色内容
             * 4-没有遮罩，半透明黑色
             */
            showNumber: "",
            top: "auto",    //距离：默认："auto"，可选：number数字
            title: "",  //弹出框提示信息标题
            skin: "",     //弹出框皮肤 green/blue
            isCloseBtn: !isMobile, //是否包含关闭按钮（pc模式显示关闭按钮/h5模式不显示关闭按钮）
            shadowType: "",   //是否阴影模式：默认：shadow，可选：none
            animateCls: "jBox-scale",  //动画样式
            hasIcon: false, //是否启用图标-针对确认框
            iconLoad: true,     //图标预加载-只可以外部设置
            closeTime: 1500,    //关闭时间-延迟时间关闭弹出框，适用-弹出提示
            closeType: 1,    //关闭选项：默认：1-自动延时关闭（弹出提示），2-触发关闭（非自动关闭，没有延时），3-不关闭，手动调用函数关闭
            /**
             * 确认框类型
             * 1-极简（不含标题，只有一个确认按钮，可包含图标），
             * 2-简单模式（不含标题，还有确认和取消两个按钮，可包含图标），
             * 3-标准模式（含有标题，确认和取消两个按钮，可包含图标），
             * 4-自定义模式（所有参数都自定义）
             */
            confirmType: 3,
            isMove: true,   //是否开启移动    PC默认开启、H5默认关闭

            //回掉函数
            initFun: null,      //初始化函数（生成DOM元素之后，样式生效之前）
            initBeforeFun: null,    //初始化之前执行（生成DOM元素之前）
            initAfterFun: null,     //初始化之后执行（给DOM元素添加样式之后）
            ensureFun: null,    //id="jBoxEnsure"的按钮确认回调
            cancelFun: null,    //id="jBoxCancel"的按钮取消回调
            closeFun: null      //关闭函数（关闭弹窗同时移除）
        };

        //box布局
        self.defaults.element = {
            cls: "",
            width: "auto",
            height: "auto",
            max_width: !isMobile ? "800px" : $(win).width() - 60,
            min_width: "400px"
        };

        //按钮
        self.defaults.btn = {
            btnDir: "h",   //按钮排列方式：默认：h，可选：v
            cls: "",    //按钮公用样式名称
            css: "",    //按钮公用样式
            array: []   //按钮数组包含{href，id，cls，css，callback}
        };

        //图标
        self.defaults.icon = {
            iconType: "img",    //图标模式：默认："img"-图片默认，可选："font"-字体模式，"none"-不使用图标
            iconDir: "v",       //图标显示模式：默认：h，可选：v
            width: "32px",
            height: "32px",
            font: "",   //当模式为："font"时，需要输入font对应的字体图标
            path: "/img/jBox/",
            src: "",
            id: ""  //当前图片的标识
        };

        //样式名称
        self.defaults.cls = {
            titleCls: "",
            contCls: "",
            btnCls: ""
        };

        //直接添加样式
        self.defaults.css = {
            titleCSS: {},
            closeCSS: {},
            titleTextCSS: {},
            contCSS: {},
            introCSS: {},
            introContCSS: {},
            iconCSS: {},
            btnCSS: {}
        };


        //全局配置函数-会被initBeforeFun替换
        self.configFun = function (option) {
            var defaults = $.extend({}, self.defaults, option);
            defaults.icon = $.extend({}, self.defaults.icon, option.icon);
            defaults.css = $.extend({}, self.defaults.css, option.css);
            defaults.cls = $.extend({}, self.defaults.cls, option.cls);
            defaults.element = $.extend({}, self.defaults.element, option.element);
            self.defaults = defaults;
        };

        //是否开启预加载
        if (self.defaults.iconLoad) {
            loadDefaultImg();
        }

        //弹出框函数
        self.alert = function (text, option) {
            //alert不需要图片，iconType="none";
            var icon = {
                icon: {
                    iconType: "none"
                }
            };
            option = $.extend({}, option, icon);
            return showBoxInit(text, option, false);
        };
        self.success = function (text, option) {
            //处理关闭预加载
            self.defaults.icon.src = defaultsIcon.success;
            self.defaults.icon.id = "success";
            return showBoxInit(text, option, false);
        };
        self.error = function (text, option) {
            //处理关闭预加载
            self.defaults.icon.src = defaultsIcon.error;
            self.defaults.icon.id = "error";
            return showBoxInit(text, option, false);
        };
        self.waring = function (text, option) {
            //处理关闭预加载
            self.defaults.icon.src = defaultsIcon.waring;
            self.defaults.icon.id = "waring";
            return showBoxInit(text, option, false);
        };
        self.loading = function (text, option) {
            //处理关闭预加载
            self.defaults.icon.src = defaultsIcon.loading;
            self.defaults.icon.id = "loading";
            //loading不需要关闭，closeType=3;
            option = $.extend({}, option, {closeType: 3});
            return showBoxInit(text, option, false);
        };

        /**
         * 确认框
         * @param text
         * @param option
         * @param option.confirmType  类型：
         * 1-极简（不含标题，只有一个确认按钮，可包含图标），
         * 2-简单模式（不含标题，还有确认和取消两个按钮，可包含图标），
         * 3-标准模式（含有标题，确认和取消两个按钮，可包含图标），
         * 4-自定义模式（所有参数都自定义）
         */
        self.confirm = function (text, option) {
            //处理关闭预加载
            return showBoxInit(text, option, true);
        };

        /**
         * 外部提供关闭-默认关闭最近打开的弹出框
         * @param ele   需要关闭的弹窗ID
         * @param type  如果type=true，关闭所有（ele需为空）
         * @param callback
         */
        self.close = function (ele, type, callback) {
            var $ele = !ele ? (type ? $(".jBox-container") : options.diskID) : $(ele);
            var closeOpt = {
                closeType: 1
            };
            closeBoxFun($ele, closeOpt, callback);
        };


        /**
         * 展示到页面
         * @param text  提示文本
         * @param option    设置相关属性
         * @param type  展示类型：false-提示弹出框，true-确认输入框
         */
        function showBoxInit(text, option, type) {
            var boxID = "";
            var opt = options = $.extend({}, self.defaults, option);
            opt.element = options.element = $.extend({}, self.defaults.element, !!option ? option.element || {} : {});
            opt.cls = options.cls = $.extend({}, self.defaults.cls, !!option ? option.cls || {} : {});
            opt.css = options.css = $.extend({}, self.defaults.css, !!option ? option.css || {} : {});
            opt.icon = options.icon = $.extend({}, self.defaults.icon, !!option ? option.icon || {} : {});
            opt.btn = options.btn = $.extend({}, self.defaults.btn, !!option ? option.btn || {} : {});

            //展示类型false-提示弹出框，true-确认输入框
            var showType = opt.showType = type;

            opt._IMG_ = _IMG_;
            opt.initBeforeFun && opt.initBeforeFun.call(this, opt);

            //展示模式showNumber
            //提示框为0，确认框为1
            opt.showNumber = opt.showNumber ? opt.showNumber : (!showType ? 0 : 1);
            //如果含有小图标&&指定的图片没有加载
            if (!!opt.icon.id && !_IMG_[opt.icon.id] && opt.icon.iconType.toString().toLowerCase() === "img") {
                loadingImage(opt.icon.path + opt.icon.src, function (src) {
                    _IMG_[opt.icon.id] = this;
                    if (!showType) {
                        //提示弹出框
                        opt.shadowType = opt.shadowType ? opt.shadowType : ((opt.showNumber === 1 || opt.showNumber === 2 || opt.showNumber === 3) ? "shadow" : "none");
                        boxID = createHTML(text, opt, false, false);
                    } else {
                        //确认框
                        opt.shadowType = opt.shadowType ? opt.shadowType : "shadow";
                        boxID = createHTML(text, opt, true, true);
                    }
                })
            } else {
                if (!showType) {
                    //提示弹出框
                    opt.shadowType = opt.shadowType ? opt.shadowType : ((opt.showNumber === 1 || opt.showNumber === 2 || opt.showNumber === 3) ? "shadow" : "none");
                    boxID = createHTML(text, opt, false, false);
                } else {
                    //确认框
                    opt.shadowType = opt.shadowType ? opt.shadowType : "shadow";
                    boxID = createHTML(text, opt, true, true);
                }
            }
            return boxID;
        }

        /**
         * 关闭函数
         * @param ele   需要关闭的对象
         * @param opt   传入参数
         * @param callback  回调函数
         * @returns {boolean}
         */
        function closeBoxFun(ele, opt, callback) {
            if (!ele) return false;
            switch (opt.closeType) {
                case 1:
                    // clearTimeout(_clear_setTimeout_);
                    _clear_setTimeout_ = win.setTimeout(function () {
                        ele.fadeOut(300, function () {
                            $(this).remove();
                            //关闭之后毁掉，此时元素已经注销
                            callback && callback.call(this, opt);
                            opt.closeFun && opt.closeFun.call(this, opt);
                        });
                    }, opt.closeTime);
                    break;
                case 2:
                    ele.fadeOut(300, function () {
                        $(this).remove();
                        //关闭之后毁掉，此时元素已经注销
                        callback && callback.call(this, opt);
                        opt.closeFun && opt.closeFun.call(this, opt);
                    });
                    break;
                case 3:
                    callback && callback.call(ele[0], opt);
                    break;
            }
        }

        /**
         * 创建主题页面
         * @param text  提示文字
         * @param opt    设置相关属性
         * @param isTitle   是否含有标题
         * @param isBtn     是否含有按钮
         */
        var createHTML = function (text, opt, isTitle, isBtn) {
            var jBoxID = opt.thisID = opt.boxID ? opt.boxID : "jBox" + new Date().getTime();
            var html = "";
            var typeCls = !isMobile ? "jBox-container-pc" : "jBox-container-h5";
            var shadowCls = opt.shadowType.toString().toLowerCase() === "shadow" ? "jBox-layout-shadow" : "";
            var textDirCls = opt.icon.iconDir.toString().toLowerCase() === "h" ? "jBox-text-left" : "jBox-text-center";
            //显示模式样式
            var styleCls;
            switch (parseInt(opt.showNumber)) {
                case 0:
                    styleCls = "jBox-container-full jBox-container-black";
                    break;
                case 1:
                    styleCls = "jBox-container-full jBox-container-white";
                    break;
                case 2:
                    styleCls = "jBox-container-full jBox-container-white transparent";
                    break;
                case 3:
                    styleCls = "jBox-container-transparent white";
                    break;
                case 4:
                    styleCls = "jBox-container-transparent black";
                    break;
            }
            //确认框模式
            var confirmCls = "", skinCls = !opt.skin ? "" : "jBox-skin skin-" + opt.skin + "";
            if (isTitle) {
                switch (parseInt(opt.confirmType)) {
                    case 1:
                        confirmCls = "jBox-confirm-mini";
                        break;
                    case 2:
                        confirmCls = "jBox-confirm-simple";
                        break;
                    case 3:
                        confirmCls = "jBox-confirm-normal";
                        break;
                    case 4:
                        opt.element.width = "auto";
                        confirmCls = "jBox-confirm-custom";
                        break;
                }
            }
            html += '<div class="jBox-container ' + typeCls + ' ' + styleCls + ' ' + confirmCls + ' ' + skinCls + '" id="' + jBoxID + '">';
            html += '<div class="jBox-layout ' + shadowCls + ' animated ' + opt.animateCls + '">';
            html += isTitle ? createTitle(opt) : "";
            html += '<div class="jBox-cont">';
            html += '<div class="jBox-intro">';
            html += '<div class="jBox-intro-cont">' + createIcon(opt) + '<div class="' + textDirCls + '">' + text + '</div></div>';
            html += '</div>';
            html += isBtn ? createBtn(opt) : "";
            html += '</div>';
            html += '</div>';
            html += '</div>';
            //添加到页面上
            $(document.body).append(html);

            //获取ID变量
            var $ID = options.diskID = $("#" + opt.thisID);

            //将元素添加到opt中，方便外部使用
            opt.popElement = {
                //三块主体
                $title: $ID.find(".jBox-title"),
                $cont: $ID.find(".jBox-cont"),
                $btn: $ID.find(".jBox-btn"),

                //其余分支
                $titleLabel: $ID.find(".jBox-title > label"),
                $titleClose: $ID.find(".jBox-title > .jBox-close-btn"),
                $intro: $ID.find(".jBox-cont  .jBox-intro"),
                $introCont: $ID.find(".jBox-cont  .jBox-intro-cont"),
                $icon: $ID.find(".jBox-cont  .jBox-icon-box"),

                //存放按钮
                $btnAry: []
            };


            //将缓存的图片添加到页面，防止多次请求
            opt.popElement.$icon.append(_IMG_[opt.icon.id]);

            opt.popElement.$btn.find("a").each(function (i) {
                opt.popElement.$btnAry[i] = $(this);
            });

            //绑定预留 "jBoxEnsure" 和 "jBoxCancel" 两个按钮
            $(document).on("click", "#jBoxEnsure", function () {
                if (opt.ensureFun) opt.ensureFun.call($ID, opt)
            });

            $(document).on("click", "#jBoxCancel", function () {
                if (opt.cancelFun) opt.cancelFun.call($ID, opt)
            });

            //初始化回调
            opt.initFun && opt.initFun.call($ID[0], opt);

            //移动函数绑定-判断模式
            if (!isMobile) {
                startEvent = "mousedown";
                moveEvent = "mousemove";
                endEvent = "mouseup";
            } else {
                //强制关闭移动端移动
                opt.isMove = false;
                startEvent = "touchstart";
                moveEvent = "touchmove";
                endEvent = "touchend";
            }

            //判断是否开启移动
            if (opt.isMove) {
                $ID.find(".jBox-title").on(startEvent, {opt: opt}, startMove);
            }

            //设置当前box大小
            setBoxLayout($ID, opt);

            //没有按钮为提示弹框
            if (!isBtn) {
                closeBoxFun($ID, opt);
            }

            //返回box生成ID
            return $ID;
        };

        /**
         * 创建标题
         * @param opt   传入设置对象OPT
         * @returns {string}    返回标题HTML
         */
        function createTitle(opt) {
            var titleHtml = "";
            var closeHTML = opt.isCloseBtn ? '<a class="jBox-close-btn" href="javascript:;">&times;</a>' : '';
            if (opt.title) {
                titleHtml += '<div class="jBox-title">';
                titleHtml += '<label class="jBox-title-text">' + opt.title + '</label>';
                titleHtml += closeHTML;
                titleHtml += '</div>';
            }
            return titleHtml;
        }

        /**
         * 创建按钮
         * @param opt   传入设置对象OPT
         * @returns {string}     返回按钮HTML
         */
        function createBtn(opt) {
            var btn = opt.btn;
            var btnHtml = "";
            var btnTypeCls = btn.btnDir.toString().toLowerCase() === "h" ? "jBox-btn-horizontal" : "jBox-btn-vertical";
            var length = btn.array.length;
            if (length) {
                btnHtml += '<div class="jBox-btn ' + btnTypeCls + '">';
                btnHtml += '<div class="jBox-btn-row' + btn.array.length + '">';
                for (var i = 0; i < length; i++) {
                    var href = btn.array[i].href ? btn.array[i].href : "javascript:;";
                    var cls = btn.array[i].cls ? btn.array[i].cls : "";
                    var id = btn.array[i].id ? btn.array[i].id : "";
                    btnHtml += '<a class="' + cls + '" id="' + id + '" href="' + href + '">' + btn.array[i].text + '</a>';
                }
                btnHtml += '</div>';
                btnHtml += '</div>';
            } else {
                btnHtml = "";
            }
            return btnHtml;
        }

        /**
         * 创建图标布局
         * @param opt
         * @returns {string}
         */
        function createIcon(opt) {
            var iconOpt = opt.icon;
            var iconHtml = "";
            var iconStyle = "width: " + iconOpt.width + "; height: " + iconOpt.height + ";";
            var iconDirCls = iconOpt.iconDir.toString().toLowerCase() === "h" ? "jBox-icon-horizontal" : "jBox-icon-vertical";
            if (opt.showType) {
                iconOpt.iconType = !opt.hasIcon ? "none" : iconOpt.iconType;
            }
            switch (iconOpt.iconType.toString().toLowerCase()) {
                case "img":
                    iconHtml += '<label class="jBox-icon-box ' + iconDirCls + ' jBox-icon-img" style="' + iconStyle + '">';
                    // iconHtml += '<img src="' + _IMG_[iconOpt.id] + '">';
                    iconHtml += '</label>';
                    break;
                case "font":
                    iconHtml += '<label class="jBox-icon-box ' + iconDirCls + ' jBox-icon-font" style="' + iconStyle + '">';
                    iconHtml += '<i class="iconfont ' + iconOpt.font + '"></i>';
                    iconHtml += '</label>';
                    break;
                case "none":
                    iconHtml = '';
                    break;
            }
            return iconHtml;
        }

        /**
         * 加载图片
         * @param src
         * @param callback
         */
        function loadingImage(src, callback) {
            var path = src;
            var image = new Image();
            image.src = path;
            if (!image.complete) {
                image.onload = function () {
                    callback && callback.call(image, src);
                };
                image.onerror = function () {
                    console.log("图片加载失败");
                };
            } else {
                // console.log("缓存图片", src);
                callback && callback.call(image, src);
            }
        }

        //加载默认图标-预加载
        function loadDefaultImg() {
            $.each(defaultsIcon, function (key, val) {
                var path = self.defaults.icon.path + val;
                loadingImage(path, function (src) {
                    _IMG_[key] = this;
                });
            });
        }

        /**
         * 设置box位置
         * @param box   传入的box对象
         * @param opt    参数
         */
        function setBoxLayout(box, opt) {
            var $box = box.find(".jBox-layout");
            var icon = opt.icon;
            var btn = opt.btn;
            var elementCls = opt.cls;
            var elementCSS = opt.css;
            var elementOpt = opt.element;

            //给 标题/内容/按钮 添加样式名称
            opt.popElement.$title.addClass(elementCls.titleCls);
            opt.popElement.$cont.addClass(elementCls.contCls);
            opt.popElement.$btn.addClass(elementCls.btnCls);

            //元素添加css样式
            opt.popElement.$title.css(elementCSS.titleCSS);  // 标题
            opt.popElement.$titleLabel.css(elementCSS.titleTextCSS);  // 标题文字
            opt.popElement.$titleClose.css(elementCSS.closeCSS);  // 关闭按钮
            opt.popElement.$cont.css(elementCSS.contCSS);  // 内容
            opt.popElement.$intro.css(elementCSS.introCSS);  //内容详包含图标情
            opt.popElement.$introCont.css(elementCSS.introContCSS);  // 内容文字详情
            opt.popElement.$icon.css(elementCSS.iconCSS);  // 内容图标详情
            opt.popElement.$btn.css(elementCSS.btnCSS);  // 按钮

            //给按钮添加样式
            $box.find(".jBox-btn a").each(function (i) {
                $(this).addClass(!btn.array[i].cls ? "" : btn.array[i].cls).css(!btn.array[i].css ? {} : btn.array[i].css).click(function () {
                    btn.array[i].callback && btn.array[i].callback.call(this, opt);
                    opt.closeType = btn.array[i].closeType || 2;
                    closeBoxFun(box, opt);
                });
            });

            //关闭按钮
            opt.popElement.$titleClose.on("click", function () {
                closeBoxFun(box, {closeType: 2});
            });

            //如果包含图标需要给paddingLeft
            if (icon.iconType !== "none" && icon.iconDir.toString().toLowerCase() === "h") {
                opt.popElement.$introCont.css("padding-left", !icon.width ? 0 : parseInt(icon.width) + 10);
            }

            var width = $box.outerWidth(true),
                height = $box.outerHeight(true);
            var new_width, new_height, left = "50%", top;
            var isVertical = opt.top.toString().toLowerCase() === "auto";
            var hasWidth = elementOpt.width.toString().toLowerCase() !== "auto";
            var hasHeight = elementOpt.height.toString().toLowerCase() !== "auto";

            //如果设置了高度，需要让内容部分垂直剧中
            if (hasHeight) {
                if (!opt.showType) {
                    opt.popElement.$cont.addClass("jBox-height");
                } else {
                    opt.popElement.$intro.height(parseInt(elementOpt.height) - opt.popElement.$title.outerHeight(true) - opt.popElement.$btn.outerHeight(true));
                }
                opt.popElement.$intro.addClass("jBox-table").find(".jBox-intro-cont").addClass("jBox-cell");
            }

            top = isVertical ? "50%" : opt.top;
            if (hasWidth && !hasHeight) {
                //设置宽，没有设置高
                new_width = elementOpt.width;
                $box.css("width", elementOpt.width);
                new_height = isVertical ? $box.outerHeight(true) : "auto";
            } else if (!hasWidth && hasHeight) {
                //设置高，没有设置宽
                new_height = elementOpt.height;
                $box.css("height", elementOpt.height);
                new_width = $box.outerWidth(true);
            } else if (hasWidth && hasHeight) {
                //同时设置高宽
                new_width = elementOpt.width;
                new_height = elementOpt.height;
                //加上固定大小的样式
                elementOpt.cls += " jBox-fixed-box";
            } else {
                //都没设置高宽
                //+1解决中英文在一起出现的问题
                if (width >= parseInt(opt.element.max_width)) {
                    new_width = parseInt(opt.element.max_width);
                } else if (width >= 350) {
                    new_width = width + 1;
                } else {
                    //弹出框自适应宽度
                    if (opt.showType) {
                        new_width = !isMobile ? 350 : 280;
                    } else {
                        new_width = !isMobile ? (width + 1) : (width + 1);
                    }
                }
                $box.css("width", new_width);
                new_height = isVertical ? $box.outerHeight(true) : "auto";
            }

            //设置位置
            $box.css({
                width: new_width,
                height: new_height,
                top: top,
                left: left,
                marginTop: isVertical ? -parseInt(new_height) / 2 + "px" : 0,
                marginLeft: -parseInt(new_width) / 2 + "px"
            }).addClass(elementOpt.cls);

            //初始化之后回调
            opt.initAfterFun && opt.initAfterFun.call($box, opt);
        }


        /**
         * 移动函数
         * 支持H5，PC（关闭H5移动）
         */
        var saveData = {}, _isMoved_ = false;

        function startMove(e) {
            var evt = e || window.event;
            // evt.stopPropagation();
            // evt.preventDefault();
            var opt = evt.data.opt;
            var $box = $("#" + opt.thisID).find(".jBox-layout");
            saveData.startX = !isMobile ? (evt.clientX || evt.pageX) : evt.originalEvent.touches[0].pageX;
            saveData.startY = !isMobile ? (evt.clientY || evt.pageY) : evt.originalEvent.touches[0].pageY;
            saveData.top = parseFloat($box.css("top"));
            saveData.left = parseFloat($box.css("left"));
            saveData.marginTop = parseFloat($box.css("marginTop"));
            saveData.marginLeft = parseFloat($box.css("marginLeft"));
            if (!_isMoved_) {
                _isMoved_ = true;
                $(document).on(moveEvent, {opt: opt}, moving);
                $(document).on(endEvent, {opt: opt}, endMove);
            }
        }

        function moving(e) {
            var evt = e || window.event;
            evt.stopPropagation();
            evt.preventDefault();
            var opt = evt.data.opt;
            var $box = $("#" + opt.thisID).find(".jBox-layout");
            var x = !isMobile ? (evt.clientX || evt.pageX) : evt.originalEvent.touches[0].pageX;
            var y = !isMobile ? (evt.clientY || evt.pageY) : evt.originalEvent.touches[0].pageY;
            if (_isMoved_) {
                var mx = x - saveData.startX + saveData.left;
                var my = y - saveData.startY + saveData.top;
                if ((saveData.marginLeft + mx) <= 0) {
                    mx = Math.abs(saveData.marginLeft);
                } else if ((saveData.marginLeft + mx) >= ($(win).width() - $box.width())) {
                    mx = ($(win).width() - $box.width() + Math.abs(saveData.marginLeft));
                }
                if ((saveData.marginTop + my) <= 0) {
                    my = Math.abs(saveData.marginTop);
                } else if ((saveData.marginTop + my) >= ($(win).height() - $box.height())) {
                    my = ($(win).height() - $box.height() + Math.abs(saveData.marginTop));
                }
                $box.css({
                    "top": my + "px",
                    "left": mx + "px"
                });
            }
        }

        function endMove() {
            _isMoved_ = false;
            $(document).off("mousemove", moving);
            $(document).off("mouseup", endMove);
        }
    };

    $.extend({
        jBox: new $.jBox()
    });
})(jQuery, window);