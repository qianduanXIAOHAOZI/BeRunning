"use strict";

class Plugin
{
    constructor() {}
    Export(name, bind_class, value) {
        this[name] = {
            bind: bind_class,
            value: value
        };
    }
}

class BeRunning
{
    static Export(namespace, plugin) {
        if (!BeRunning._plugins.namespaces[namespace]) BeRunning._plugins.namespaces[namespace] = {};
        for (let i in plugin) {
            BeRunning._plugins.namespaces[namespace][i] = plugin[i];
            if (plugin[i].bind == BeRunning.global) {
                BeRunning[i] = plugin[i].value;
            } else {
                plugin[i].bind.prototype[i] = plugin[i].value;
            }
            // console.log(plugin);
        }
    }
    using(namespace) {
        this._using = namespace;
    }
    static VERSION() {
        return "BeRunning-v0.1.1";
    }
    constructor(id) {
        console.log(BeRunning.VERSION());
        this._dom = document.getElementById(id);
        this._ctx = this._dom.getContext("2d");
        this._screen_x = 0;
        this._screen_y = 0;
        this._items = [];
        this._scale = 1.0;
        this._values = {};
        this.KEY_DOWN = 1;
        this.KEY_UP = 2;
        this.KEY_PRESS = 3;
        this._focal = null;
        this._audios = {};
        this.using("BR");
    }
    width(w) {
        if (w) {
            this._dom.width = w;
            return this;
        }
        return this._dom.width;
    }
    height(h) {
        if (h) {
            this._dom.height = h;
            return this;
        }
        return this._dom.height;
    }
    x(x) {
        if (x !== undefined) {
            this._screen_x = x;
            return this;
        }
        return this._screen_x;
    }
    y(y) {
        if (y !== undefined) {
            this._screen_y = y;
            return this;
        }
        return this._screen_y;
    }
    size(w, h) {
        return this.width(w).height(h);
    }
    scale(s) {
        if (s) {
            this._scale = s;
            return this;
        }
        return this._scale;
    }
    full() {
        this.width(window.innerWidth).height(window.innerHeight);
        this._dom.style.width = "100%";
        this._dom.style.height = "100%";
        this._dom.style.display = "block";
        let th = this;
        window.onresize = function () {
            th.width(window.innerWidth).height(window.innerHeight);
        }
    }
    bind(item) {
        this._items.push(item);
        item.bind(this);
        this._items.sort(function (a, b) {
            return a.layer() - b.layer()
        });
    }
    ctx() {
        return this._ctx;
    }
    update() {
        let th = this;
        this.ctx().clearRect(0, 0, this.width(), this.height());
        for (let i = 0 ; i < th._items.length ; i++) {
            th._items[i].render();
        }
        return this;
    }
    move(x ,y) {
        return this.x(x).y(y);
    }
    render(callback) {
        let th = this;
        requestAnimationFrame(function step () {
            th.update();
            // console.log(th);
            if (th._focal) {
                th.move(th._focal.x() - th.width() / 2 + th._focal.width(), th._focal.y() - 300);
            }
            if (callback) callback(th);
            requestAnimationFrame(step);
        });
        return this;
    }
    key(type, callback) {
        if (type = this.KEY_DOWN) {
            // console.log(arguments);
            document.onkeydown = function (e) {
                callback(e, this)
            };
        }
        if (type = this.KEY_PRESS) {
            document.onkeypress = function (e) {
                callback(e, this)
            };
        }
        if (type = this.KEY_UP) {
            document.onkeyup = function (e) {
                callback(e, this)
            };
        }
    }
    focal(item) {
        if (item) {
            this._focal = item;
            return this;
        }
        return this._focal;
    }
    set(attr, value) {
        this._values[attr] = value;
        return this;
    }
    get(attr) {
        return this._values[attr];
    }
    load_audios(audios) {
        for (let i in audios) {
            let a = new Audio(audios[i]);
            a.load();
            // console.log(a);
            this._audios[audios[i]] = a;
        }
    }
    itemLen() {
        return this._items.length;
    }
    play(audio, callback) {
        // console.log(this._audios);
        let a = this._audios[audio];
        if (!a) {
            console.error("Load audio " + this.audios[i] + " failed.");
            return false;
        }
        for (let i = 1 ; i < arguments.length ; i++) {
            if (arguments[i] == "loop") {
                a.loop = true;
            }
        }
        // while (a.readyState != 4) {}
        let checker = setInterval(function () {
            if (a.readyState == 4) {
                a.play();
                clearInterval(checker);
            }
        }, 100);
        a.onended = function () {
            if (callback && typeof callback == "function") {
                callback();
            }
        }
    }
}
BeRunning._plugins = {
    namespaces: {},
    default_using: "BR"
};
BeRunning.global = true;// This is a property for binding plugins. If the plugin is a global binding, the bind property should be BeRunning.global

class Item
{
    constructor(name, x, y, width, height, layer, material) {
        this._name = name;
        this._x = x;
        this._y = y;
        this._width = width;
        this._height = height;
        this._layer = layer;
        this._parent = null;
        this._material_finish = false;
        if (material !== BeRunning.selfCreate) {
            this._material = new Image();
            this._material.src = material;
            this._material.onload = function () {
                th._material_finish = true;
            }
        } else {
            this._material_finish = true;
        }
        this._values = {};
        this._audios = {};
        this._rotate = 0;
        this._destory = false;
        let th = this;
    }
    name() {
        return this._name;
    }
    material(material) {
        if (material) {
            this._material = new Image();
            this._material.src = material;
            this._material_finish = false;
            let th = this;
            this._material.onload = function () {
                th._material_finish = true;
            };
            return this;
        }
        return this._material.src;
    }
    width(w) {
        if (w) {
            this._width = w;
            return this;
        }
        return this._width;
    }
    height(h) {
        if (h) {
            this._height = h;
            return this;
        }
        return this._height;
    }
    x(x) {
        if (x !== undefined) {
            this._x = x;
            return this;
        }
        return this._x;
    }
    y(y) {
        if (y !== undefined) {
            this._y = y;
            return this;
        }
        return this._y;
    }
    move(x ,y) {
        return this.x(x).y(y);
    }
    layer(n) {
        if (n) {
            this._layer = n;
            return this;
        }
        return this._layer;
    }
    bind(parent) {
        this._parent = parent;
    }
    render() {
        if (this._destory) return this;
        if (!this._parent) return this;
        if (!this._material_finish) return this;
        let x = (this._x - this._parent.x()) * this._parent.scale();
        let y = (this._y - this._parent.y()) * this._parent.scale();
        let ctx = this._parent.ctx();
        ctx.rotate(this._rotate);
        // height * sin(r)
        // height * cos(r)
        x += this.height() * Math.cos(this._rotate) / 2;
        y -= this.height() * Math.sin(this._rotate);
        if (this._material === BeRunning.selfCreate) {
            this["customize-render"](ctx);
        } else {
            ctx.drawImage(
                this._material,
                x, y,
                this._width * this._parent.scale(), this._height * this._parent.scale()
            );
        }
        for (let i in this) {
            if (
                typeof this[i] == "function" &&
                i.search(/-render$/) > -1 &&
                i !== "customize-render"
            ) {
                this[i]();
            }
        }
        ctx.rotate(-this._rotate);
        return this;
    }
    set(attr, value) {
        this._values[attr] = value;
        return this;
    }
    get(attr) {
        return this._values[attr];
    }
    collision(item) {
        if (item.type() == "control") return false;
        return (
            item.x() <= this.x() && item.x() + item.width() >= this.x() &&
            item.y() <= this.y() && item.y() + item.height() >= this.y()
        );
    }
    collision_find(com) {
        let items = this._parent._items;
        for (let i in items) {
            if (com(items[i]) && items[i].collision(this)) {
                return true;
            }
        }
        return false;
    }
    collision_find_name(name) {
        return this.collision_find(function (i) {
            return i.name() == name
        });
    }
    collision_find_val(com) {
        let items = this._parent._items;
        for (let i in items) {
            if (com(items[i]) && items[i].collision(this)) {
                return items[i];
            }
        }
        return null;
    }
    collision_find_val_name(name) {
        return this.collision_find_val(function (i) {
            return i.name() == name
        });
    }
    collision_find_list_val(com) {
        let items = this._parent._items;
        let list = [];
        for (let i in items) {
            if (com(items[i]) && items[i].collision(this)) {
                list.push(items[i]);
            }
        }
        return list;
    }
    collision_find_list_val_name(name) {
        return this.collision_find_list_val(function (i) {
            return i.name() == name
        });
    }
    left(s) {
        return this.x(this.x() - s);
    }
    right(s) {
        return this.x(this.x() + s);
    }
    up(s) {
        return this.y(this.y() - s);
    }
    down(s) {
        return this.y(this.y() + s);
    }
    load_audios(audios) {
        for (let i in audios) {
            let a = new Audio(audios[i]);
            a.load();
            this._audios[audios[i]] = a;
        }
    }
    play(audio) {
        let a = this._audios[audio];
        if (!a) {
            console.error("Load audio " + audios[i] + " failed.");
            return false;
        }
        while (a.readyState) {}
        a.play();
    }
    rotate(angle) {
        if (angle === undefined) return this._rotate;
        this._rotate = angle;
        return this;
    }
    destory(flag) {
        if (flag)
            this._destory = true;
        else
            return this._destory;
    }
    type() {
        return "item";
    }
}

!function () {
    let BR_text = new Plugin();
    BR_text.Export("text", Item, function (txt, color, font, offset) {
        this._txt = txt;
        if (color === void(0)) {
            this._font_color = "#000";
        } else {
            this._font_color = color;
        }
        if (font === void(0)) {
            this._font = "bold 100px";
        } else {
            this._font = font;
        }
        if (font === void(0)) {
            this._offset = 0;
        } else {
            this._offset = offset;
        }
        return this;
    });
    BR_text.Export("text-render", Item, function () {
        let ctx = this._parent.ctx();
        // console.log(this);
        ctx.fillStyle = this._font_color;
        ctx.font = this._font;
        // console.log(this._txt, this._font_color, this._font_size);
        if (typeof this._offset == "number")
            ctx.fillText(this._txt, this.x() + this._offset, this.y() + this._offset);
        else
            ctx.fillText(this._txt, this.x() + this._offset.x, this.y() + this._offset.y);
        // console.log(ctx.font);
        return this;
    });
    BeRunning.Export("BR", BR_text);
    let materialCreator = new Plugin();
    materialCreator.Export("selfCreate", BeRunning.global, true);
    materialCreator.Export("customize", Item, function (customizeFun) {
        this._material = BeRunning.selfCreate;
        this._customize = customizeFun;
    });
    materialCreator.Export("customize-render", Item, function () {
        let ctx = this._parent.ctx();
        this._customize(ctx);
    });
    BeRunning.Export("BR", materialCreator);
}();

class Control extends Item
{
    constructor(name, x, y, size, icon) {
        super(name, x, y, size, size, 0, icon);
        this._parent = null;
        this._fade = false;
        this._size = size;
        this._rotate = 0;
    }
    bind(p) {
        if (p) {
            this._parent = p;
            this.layer(p.itemLen());
            return this;
        }
        return this._parent;
    }
    size(s) {
        if (s === undefined) return this._size;
        this._size = s;
        this.width(s).height(s);
        return this;
    }
    fade(f) {
        if (f === undefined) return this._fade;
        this._fade = f;
        return this;
    }
    render() {
        if (!this._parent) return this;
        if (!this._material_finish) return this;
        if (this._destory) return this;
        if (this._fade) return this;
        let ctx = this._parent._ctx;
        ctx.rotate(this._rotate);
        ctx.drawImage(
            this._material,
            this.x(), this.y(),
            this._size, this._size
        );
        ctx.rotate(-this._rotate);
        return this;
    }
    hover(callback) {
        let th = this;
        this._parent._dom.onmousemove = function (e) {
            let x = e.offsetX, y = e.offsetY;
            if (
                x >= th.x() && x <= th.x() + th.width() &&
                y >= th.y() && y <= th.y() + th.height()
            ) {
                if (callback) callback(th);
            }
        };
    }
    click(callback) {
        let th = this;
        this._parent._dom.onclick = function (e) {
            let x = e.offsetX, y = e.offsetY;
            if (
                x >= th.x() && x <= th.x() + th.width() &&
                y >= th.y() && y <= th.y() + th.height()
            ) {
                if (callback) callback(th);
            }
        };
    }
    type() {
        return "control";
    }
}

class BRWindow extends Item
{
    constructor(name, x, y, width, height) {
        super(name, x, y, width, height, 0, "../images/space.png");
        this._parent = null;
        this._fade = false;
        this._width = width;
        this._height = height;
        this._rotate = 0;
        this._controls = [];
    }
    push(ctrl) {
        this._controls.push(item);
    }
    bind(p) {
        if (p) {
            this._parent = p;
            this.layer(p.itemLen());
            return this;
        }
        return this._parent;
    }
    fade(f) {
        if (f === undefined) return this._fade;
        this._fade = f;
        return this;
    }
    render() {
        if (!this._parent) return this;
        if (!this._material_finish) return this;
        if (this._destory) return this;
        if (this._fade) return this;
        for (let i in this._controls) {
            this._controls.render();
        }
        return this;
    }
    hover(callback) {
        let th = this;
        this._parent._dom.onmousemove = function (e) {
            let x = e.offsetX, y = e.offsetY;
            if (
                x >= th.x() && x <= th.x() + th.width() &&
                y >= th.y() && y <= th.y() + th.height()
            ) {
                if (callback) callback(th);
            }
        };
    }
    click(callback) {
        let th = this;
        this._parent._dom.onclick = function (e) {
            let x = e.offsetX, y = e.offsetY;
            if (
                x >= th.x() && x <= th.x() + th.width() &&
                y >= th.y() && y <= th.y() + th.height()
            ) {
                if (callback) callback(th);
            }
        };
    }
    type() {
        return "window";
    }
}

!function () {
    let color = new Plugin();
    function hex(rgb) {
        if (typeof rgb == "string") {
            rgb = obj_rgb(rgb);
        }
        let red = rgb.r;
        let green = rgb.g;
        let blue = rgb.b;
        red = red.toString(16);
        green = green.toString(16);
        blue = blue.toString(16);
        if (red.length == 1)
            red = red + red;
        if (green.length == 1)
            green = green + green;
        if (blue.length == 1)
            blue = blue + blue;
        let hex = {
            r: red,
            g: green,
            b: blue,
        };
        hex.toString = function (){
            return "#" + this.r + this.g + this.b;
        };
        return hex;
    }
    function rgb(hex) {
        if (typeof hex == "object")
            hex = hex.toString();
        if (hex.length != 4 && hex.length != 7)// hex first is "#"
            return NaN;
        hex = hex.split("");
        let tmp = [];
        for (var i = 1 ; i < hex.length ; i++)// rm hex[0]
            tmp.push(hex[i]);
        hex = tmp;
        let rgb = {r: 0,g: 0,b: 0};
        if (hex.length == 3){
            rgb.r = parseInt(hex[0] + hex[0],16);
            rgb.g = parseInt(hex[1] + hex[1],16);
            rgb.b = parseInt(hex[2] + hex[2],16);
        } else {
            rgb.r = parseInt(hex[0] + hex[1],16);
            rgb.g = parseInt(hex[2] + hex[3],16);
            rgb.b = parseInt(hex[4] + hex[5],16);
        }
        rgb.toString = function (){
            let string = "rgb(";
            string += this.r + ",";
            string += this.g + ",";
            string += this.b + ")";
            return string;
        };
        return rgb;
    }
    function obj_rgb(str_rgb) {
        let rgb = {};
        let arr_rgb = str_rgb.split("(")[1].split(")")[0].split(",");
        rgb.r = arr_rgb[0];
        rgb.g = arr_rgb[1];
        rgb.b = arr_rgb[2];
        rgb.toString = function (){
            let string = "rgb(";
            string += this.r + ",";
            string += this.g + ",";
            string += this.b + ")";
            return string;
        };
        return rgb;
    }
    function obj_hex(str_hex) {
        let h = rgb(str_hex);
        h = hex(h);
        return h;
    }
    color.Export("hex", BeRunning.global, hex);
    color.Export("obj_hex", BeRunning.global, obj_hex);
    color.Export("rgb", BeRunning.global, rgb);
    color.Export("obj_rgb", BeRunning.global, obj_rgb);
    BeRunning.Export("BR", color, "color");
}();