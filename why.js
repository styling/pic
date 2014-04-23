var Vanery = function() {
    this.init.apply(this, arguments);
}

Vanery.prototype = {
    constructor: Vanery,
    init: function(config) {
        this.canvas = document.getElementById(config.canvas);
        this.canvas2D = this.canvas.getContext('2d');
        this.txtContent = document.getElementById(config.txt);
        this.imgContent = document.getElementById(config.img);
        console.log(this.canvas, this.canvas2D, this.txtContent, this.imgContent)
        this.uiSet();
    },
    uiSet: function() {
        var that = this;
        this.imgContent.addEventListener("load", function () {
            that.txtResize();
        });
    },
    encodeImg: function(g) {
        if (g <= 30) {
            return '#';
        } else if (g > 30 && g <= 60) {
            return '&';
        } else if (g > 60 && g <= 120) {
            return '$';
        } else if (g > 120 && g <= 150) {
            return '*';
        } else if (g > 150 && g <= 180) {
            return 'o';
        } else if (g > 180 && g <= 210) {
            return '!';
        } else if (g > 210 && g <= 240) {
            return ';';
        } else {
            return '&nbsp;';
        }
    },
    getGray: function(r, g, b) {
        return 0.299 * r + 0.578 * g + 0.114 * b;
    },
    txtResize: function() {
        this.txtContent.style.width = this.imgContent.width + 'px';
        this.canvas.width = this.imgContent.width;
        this.canvas.height = this.imgContent.height;
        this.canvas2D.drawImage(this.imgContent, 0, 0);
        var imgData = this.canvas2D.getImageData(0, 0, this.imgContent.width, this.imgContent.height);
        var imgDataArr = imgData.data;
        var imgDataWidth = imgData.width;
        var imgDataHeight = imgData.height;
        var index, gray, html = [];
        for (h = 0; h < imgDataHeight; h += 12) {
            var p = '<p>';
            html.push('<p>');
            for (w = 0; w < imgDataWidth; w += 6) {
                index = (w + imgDataWidth * h) * 4;
                gray = this.getGray(imgDataArr[index + 0], imgDataArr[index + 1], imgDataArr[index + 2]);
                html.push(this.encodeImg(gray))
            }
            html.push('</p>');
        }
        this.txtContent.innerHTML = html.join("");
    },
    /*getImg: function(file) {
        var reader = new FileReader();
        reader.readAsDataURL(fileBtn.files[0]);
        reader.onload = function() {
            img.src = reader.result;
        }
    },*/
    bind: function(func, context) {
        var _native_bind = Function.prototype.bind, args, bound;
        //存在 且原生 就用emca5
        if (_native_bind && func.bind === _native_bind) {
            return _native_bind.apply(func, slice.call(arguments, 1));
        }
        //func不是function 就抛出错误
        if (Object.prototype.toString.call(func) != "[object Function]") {
            throw new TypeError;
        }
        //调用Array.prototype.slice 取得func及context以外的arguments
        args = slice.call(arguments, 2);
        return bound = function() {
            if (!(this instanceof bound)) {
                return func.apply(context, args.concat(slice.call(arguments)));
            }
            ctor.prototype = func.prototype;
            var self = new ctor;
            ctor.prototype = null;
            var result = func.apply(self, args.concat(slice.call(arguments)));
            if (Object(result) === result) return result;
            return self;
        };
    }
}

new Vanery({
    canvas : "cv",
    txt : "txt",
    img : "img"
});
