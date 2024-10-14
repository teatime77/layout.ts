namespace layout_ts {
//
export function bodyOnLoad(){
    i18n_ts.initI18n();

    const root = makeTestUI();
    initLayout(root);
}


function ratio(width : string) : number {
    width = width.trim();
    assert(width.endsWith("%"));
    const num_str = width.substring(0, width.length - 1);

    const num = parseFloat(num_str);

    return num / 100;
}


function pixel(length : string,  remaining_length? : number) : number {
    if(length != undefined){
        if(length.endsWith("px")){
            const num_str = length.substring(0, length.length - 2);

            return parseFloat(num_str);
        }
        else if(length.endsWith("%")){
            if(remaining_length != undefined){
                return ratio(length) * remaining_length;
            }
        }
    }
    
    throw new MyError();
}


interface Attr {
    id? : string;
    parent? : Block;
    obj? : any;
    name? : string;
    backgroundColor? : string;
    borderStyle? : string;
    borderWidth? : number;
    colspan? : number;
    width? : string;
    height? : string;
    aspectRatio? : number;
}

export class UI {
    static count : number = 0;

    idx : number;
    id? : string;
    parent? : Block;
    obj? : any;
    name? : string;
    backgroundColor? : string;
    borderStyle? : string;
    borderWidth? : number;
    width? : string;
    height? : string;
    aspectRatio? : number;
    colspan : number = 1;

    width_px? : number;

    constructor(data : Attr){   
        Object.assign(this, data);
        this.idx = ++UI.count;
    }

    setStyle(data : Attr){
        const ele = this.html();

        if(data.id != undefined){
            ele.id = data.id;
        }

        if(this.borderWidth != undefined){
            ele.style.borderWidth = `${this.borderWidth}`;
        }
        if(this.borderStyle != undefined){
            ele.style.borderStyle = this.borderStyle;
        }

        if(this.backgroundColor != undefined){
            ele.style.backgroundColor = this.backgroundColor;
        }
    }

    html() : HTMLElement {
        throw new MyError();
    }

    make(){        
    }

    setWidth(width : number){
        this.width_px = width;
        this.html().style.width = `${width}px`;
    }

    setXY(x : number, y : number){
        const html = this.html();

        html.style.left = `${x}px`;
        html.style.top  = `${y}px`;
    }

    setSize(width : number, height : number){
        const html = this.html();

        html.style.width  = `${width}px`;
        html.style.height = `${height}px`;

    }

    layout(x : number, y : number, width : number, height : number){
        this.setXY(x, y);
        this.setSize(width, height);
    }

    ratio() : number {
        if(this.width == undefined || ! this.width.endsWith("%")){
            throw new MyError();
        }

        const s = this.width.substring(0, this.width.length - 1);
        return parseFloat(s);
    }
}

export class AbstractText extends UI {
    fontName? : string;
    fontSize? : string;
}

export class Label extends AbstractText {
    span : HTMLSpanElement;

    constructor(data : Attr){        
        super(data);
        this.span = document.createElement("span");
        this.setStyle(data);
    }

    html() : HTMLElement {
        return this.span;
    }
}

export class Text extends AbstractText {
    input : HTMLInputElement;

    constructor(data : Attr){        
        super(data);
        this.input = document.createElement("input");
        this.setStyle(data);
    }

    html() : HTMLElement {
        return this.input;
    }
}

export class Img extends UI {
    img : HTMLImageElement;

    constructor(data : Attr){        
        super(data);
        this.img = document.createElement("img");
        this.setStyle(data);
    }

    html() : HTMLElement {
        return this.img;
    }
}

export class Button extends UI {
    button : HTMLButtonElement;
    text : string;

    constructor(data : Attr & { text : string }){        
        super(data);
        this.text = data.text;
        this.button = document.createElement("button");
        this.button.innerText = this.text;
        this.setStyle(data);
    }

    html() : HTMLElement {
        return this.button;
    }
}

export class CheckBox extends UI {
    text : string;
    input : HTMLInputElement;
    span  : HTMLSpanElement;

    constructor(data : Attr & { text : string }){
        super(data);
        this.text = data.text;

        this.input = document.createElement("input");
        this.input.type = "checkbox";
        this.input.id = `layout.ts-checkbox-${this.idx}`;
    
        const label = document.createElement("label");
        label.htmlFor = this.input.id;
        label.textContent = this.text;    

        this.span = document.createElement("span");
        this.span.append(this.input);
        this.span.append(label)

    }

    html() : HTMLElement {
        return this.span;
    }
}

export class RadioButton extends UI {
    button : HTMLButtonElement;

    constructor(data : Attr & { value : string, title : string, url : string }){
        super(data);

        this.button = document.createElement("button");
        this.button.value = data.value;
        this.button.title = data.title;
        this.button.style.margin      = "2px";
        this.button.style.borderWidth = "1px";

        const img = document.createElement("img");
        img.src = data.url;

        if(data.width != undefined){

            img.style.width  = data.width;
        }

        if(data.height != undefined){
            img.style.height = data.height;
        }

        this.button.append(img);

        this.setStyle(data);
    }

    html() : HTMLElement {
        return this.button;
    }

}

export class Block extends UI {
    div : HTMLDivElement;
    children : UI[];

    constructor(data : Attr & { children : UI[] }){        
        super(data);
        this.div = document.createElement("div");
        this.div.style.position = "fixed";

        this.children = data.children;

        this.children.forEach(x => this.div.append(x.html()));

        this.setStyle(data);
    }

    html() : HTMLElement {
        return this.div;
    }

    getAll() : HTMLElement[] {
        let htmls : HTMLElement[] = [ this.html() ];
        for(const child of this.children){
            if(child instanceof Block){
                htmls = htmls.concat(child.getAll());
            }
            else{
                htmls.push(child.html());
            }
        }

        return htmls;
    }

    getElementById(id : string) : HTMLElement | undefined {
        return this.getAll().find(x => x.id == id);
    }
}

export class Flex extends Block {
    direction : string;

    constructor(data : Attr & { direction?: string, children : UI[] }){
        super(data);

        this.direction = (data.direction != undefined ? data.direction : "row");
        this.children = data.children;

        this.children.forEach(x => this.div.append(x.html()));

        this.div.style.display = "flex";
        this.div.style.flexDirection = this.direction;
    }
}

export class Grid extends Block {
    columns : string[];
    rows : string[];

    constructor(data : Attr & { columns?: string, rows? : string, children : UI[] }){        
        super(data);
        if(data.columns != undefined){

            this.columns = data.columns.split(" ");
        }
        else{
            this.columns = ["100%"];
        }

        if(data.rows != undefined){

            this.rows = data.rows.split(" ");
        }
        else{
            this.rows = ["100%"];
        }
    }

    layout(x : number, y : number, width : number, height : number){
        super.layout(x, y, width, height);

        let widths : number[];
        let heights : number[];

        const fixed_width = sum(this.columns.filter(x => x.endsWith("px")).map(x => pixel(x)));
        const remaining_width = width - fixed_width;
        widths = this.columns.map(x => pixel(x, remaining_width));

        const fixed_height = sum(this.rows.filter(x => x.endsWith("px")).map(x => pixel(x)));
        const remaining_height = height - fixed_height;
        heights = this.rows.map(x => pixel(x, remaining_height));

        let row = 0;
        let col = 0;
        let child_x = x;
        let child_y = y;
        for(const child of this.children){
            let child_width : number;
            if(child.colspan == 1){
                child_width = widths[col];
            }
            else{
                child_width = sum(widths.slice(col, col + child.colspan))
            }

            let child_height : number;
            if(child.aspectRatio == undefined){
                child_height = heights[row];
            }
            else{
                child_height = child.aspectRatio * child_width;
            }

            child.layout(child_x, child_y, child_width, child_height);

            if(col + child.colspan < widths.length){

                child_x += widths[col];
                col += child.colspan;
            }
            else{
                child_x   = 0;
                child_y += heights[row];

                col = 0;
                row++;
            }
        }
    }  
    
    resize(){
        const width = window.innerWidth;
        const height = window.innerHeight;
        this.layout(0, 0, width, height);
    }
}

export function $label(data : Attr) : Label {
    return new Label(data);
}

export function $text(data : Attr) : Text {
    return new Text(data);
}

export function $img(data : Attr) : Img {
    return new Img(data);
}

export function $button(data : Attr & { text : string }) : Button {
    return new Button(data);
}

export function $checkbox(data : Attr & { text : string }) : CheckBox {
    return new CheckBox(data);
}

export function $radio(data : Attr & { value : string, title : string, url : string }){
    return new RadioButton(data);
}

export function $block(data : Attr & { children : UI[] }) : Block {
    return new Block(data);
}

export function $grid(data : Attr & { columns?: string, rows? : string, children : UI[] }) : Grid {
    return new Grid(data);
}

function makeTestUI(){
    const k = document.location.href.lastIndexOf("/");
    const home = document.location.href.substring(0, k);
    msg(`home:${home}`);

    const root = $grid({
        rows     : "50px 50px 100%",
        children:[
            $block({
                children : [],
                backgroundColor : "chocolate",
            })
            ,
            $grid({
                columns  : "50% 50%",
                children: [
                    $block({
                        children : [
                            $checkbox({
                                text : "Axis"
                            })
                        ],
                        backgroundColor : "lime",
                    })
                    ,
                    $block({
                        children : [
                            $button({
                                text : "Play"
                            })
                        ],
                        backgroundColor : "violet",
                    })
                ]
            })
            ,
            $grid({
                columns  : "50px 50% 50% 300px",

                children : [
                    $block({
                        children : [
                            $radio({
                                value : "",
                                title : "",
                                width : "24px",
                                height : "24px",
                                url : `${home}/lib/plane/img/selection.png`
                            })
                            ,
                            $radio({
                                value : "",
                                title : "",
                                width : "24px",
                                height : "24px",
                                url : `${home}/lib/plane/img/point.png`
                            })
                        ],
                        backgroundColor : "green",
                    })
                    ,
                    $block({
                        children : [],
                        aspectRatio : 1,
                        backgroundColor : "blue",
                    })
                    ,
                    $block({
                        children : [],
                        aspectRatio : 1,
                        backgroundColor : "orange",
                    })
                    ,
                    $block({
                        children : [],
                        backgroundColor : "cyan",
                    }),
                ]
            })
        ]
    });

    return root;
}

export function initLayout(root : Grid){
    document.body.append(root.div);
    root.resize();

    window.addEventListener("resize", root.resize.bind(root));
}

}