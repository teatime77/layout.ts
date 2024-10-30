namespace layout_ts {
//
type MouseEventCallback = (ev : MouseEvent)=>Promise<void>;
type EventCallback = (ev : Event)=>Promise<void>;

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

export abstract class UI {
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

    width_px  : number = NaN;
    height_px : number = NaN;
    x_px : number = NaN;
    y_px : number = NaN;

    constructor(data : Attr){   
        Object.assign(this, data);
        this.idx = ++UI.count;
    }

    setStyle(data : Attr) : UI {
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

        if(data.width != undefined){
            ele.style.width = data.width;
        }

        if(data.height != undefined){
            ele.style.height = data.height;
        }

        return this;
    }

    abstract html() : HTMLElement;

    getWidth() : number {
        if(this.width != undefined){
            if(this.width.endsWith("px")){
                return pixel(this.width);
            }
        }

        const rect = this.html().getBoundingClientRect();
        return rect.width;
    }

    getHeight() : number {
        if(this.height != undefined){
            if(this.height.endsWith("px")){
                return pixel(this.height);
            }
        }

        const rect = this.html().getBoundingClientRect();
        return rect.height;
    }

    setXY(x : number, y : number){
        if(x == -100){
            console.log("");
        }
        this.x_px = x;
        this.y_px = y;

        const html = this.html();

        html.style.left = `${x}px`;
        html.style.top  = `${y}px`;
    }

    setSize(width : number, height : number){
        this.width_px  = width;
        this.height_px = height;

        const html = this.html();

        html.style.width  = `${width}px`;
        html.style.height = `${height}px`;
    }

    selectUI(selected : boolean){
    }

    layout(x : number, y : number, width : number, height : number){
        this.setXY(x, y);
        this.setSize(width, height);
    }

    updateLayout(){
        this.layout(this.x_px, this.y_px, this.width_px, this.height_px);
    }

    ratio() : number {
        if(this.width == undefined || ! this.width.endsWith("%")){
            throw new MyError();
        }

        const s = this.width.substring(0, this.width.length - 1);
        return parseFloat(s);
    }
}

export abstract class AbstractText extends UI {
    text : string;
    fontName? : string;
    fontSize? : string;

    constructor(data : Attr & { text : string }){
        super(data);
        this.text = data.text;
    }
}

export class Label extends AbstractText {
    span : HTMLSpanElement;

    constructor(data : Attr & { text : string }){        
        super(data);

        this.span = document.createElement("span");
        this.span.innerText = this.text;
    }

    html() : HTMLElement {
        return this.span;
    }
}

export class TexUI extends AbstractText {
    div : HTMLDivElement;
    click? : MouseEventCallback;

    constructor(data : Attr & { text : string, click? : MouseEventCallback }){        
        super(data);
        this.click = data.click;

        this.div = document.createElement("div");
        this.div.addEventListener("click", async (ev:MouseEvent)=>{
            if(this.click != undefined){
                await this.click(ev);
            }
        });

        if(this.parent == undefined){
            throw new MyError();
        }

        this.parent.addChild(this)
    }

    html() : HTMLElement {
        return this.div;
    }

    setText(text : string){
        this.text = text;
        parser_ts.renderKatexSub(this.div, this.text);
    }

    show(){
        this.div.style.display = "";
    }

    hide(){
        this.div.style.display = "none";
    }
}

abstract class AbstractInput extends UI {
    input : HTMLInputElement;
    change? : (ev : Event)=>Promise<void>;

    constructor(data : Attr & { change? : EventCallback }){
        super(data);
        this.change = data.change;

        this.input = document.createElement("input");

        if(this instanceof InputText){

            this.input.addEventListener("input", async (ev : Event)=>{
                msg("input event");
                if(this.change != undefined){
                    await this.change(ev);
                }
            });
        }
        else{

            this.input.addEventListener("change", async (ev : Event)=>{
                msg("change event");
                if(this.change != undefined){
                    await this.change(ev);
                }
            });
        }
    }

    html() : HTMLElement {
        return this.input;
    }
}

export class InputText extends AbstractInput {
    
    constructor(data : Attr & { text : string, change? : EventCallback }){
        super(data);
        this.input.type = "text";
        this.input.value = data.text;
    }
}


export class InputColor extends AbstractInput {
    constructor(data : Attr & { text : string, change? : EventCallback }){
        super(data);
        this.input.type = "color";
    }
}


export class InputNumber extends AbstractInput {

    constructor(data : Attr & { value? : number, step? : number, min? : number, max? : number, change? : EventCallback }){
        super(data);
        
        if(data.width == undefined){
            data.width = "50px";
        }

        this.input.type = "number";

        if(data.value != undefined){
            this.input.value = `${data.value}`;
        }
        if(data.step != undefined){
            this.input.step = `${data.step}`;
        }
        if(data.min != undefined){
            this.input.min = `${data.min}`;
        }
        if(data.max != undefined){
            this.input.max = `${data.max}`;
        }
    }

    value() : number {
        return parseFloat(this.input.value);
    }
}

export class CheckBox extends AbstractInput {
    span  : HTMLSpanElement;

    constructor(data : Attr & { text : string, change? : EventCallback }){
        super(data);

        this.input.type = "checkbox";
        this.input.id = `layout.ts-checkbox-${this.idx}`;
    
        const label = document.createElement("label");
        label.htmlFor = this.input.id;
        label.textContent = data.text;    

        this.span = document.createElement("span");
        this.span.append(this.input);
        this.span.append(label);
    }

    html() : HTMLElement {
        return this.span;
    }

    checked() : boolean {
        return this.input.checked;
    }
}

export class TextArea extends UI {
    textArea : HTMLTextAreaElement;
    change? : EventCallback;

    constructor(data : Attr & { value? : string, cols : number, rows : number, change? : EventCallback }){
        super(data);
        this.change = data.change;
        this.textArea = document.createElement("textarea");
        if(data.value != undefined){
            this.textArea.value = data.value;
        }

        this.textArea.cols = data.cols;
        this.textArea.rows = data.rows;

        this.textArea.addEventListener("input", async (ev : Event)=>{
            if(this.change != undefined){
                await this.change(ev);
            }
        });
    }

    html() : HTMLElement {
        return this.textArea;
    }

    getValue() : string {
        return this.textArea.value;
    }
}

export class Img extends UI {
    img : HTMLImageElement;

    constructor(data : Attr){        
        super(data);
        this.img = document.createElement("img");
    }

    html() : HTMLElement {
        return this.img;
    }
}

abstract class AbstractButton extends UI {
    static imgMargin = 2;

    value?  : string;
    button : HTMLButtonElement;    

    constructor(data : Attr & { value? : string, text? : string, url? : string }){
        super(data);
        this.value = data.value;
        this.button = document.createElement("button");
        this.button.style.position = "absolute";
        this.button.style.padding = "1px";

        if(data.text != undefined){
            this.button.innerText = data.text;
        }

        if(data.url != undefined){
            const img = document.createElement("img");
            img.src = data.url;
    
            // if(data.width == undefined || data.height == undefined){
            //     throw new MyError();
            // }

            // img.style.position = "absolute";
            // img.style.left   = `${AbstractButton.imgMargin}px`;
            // img.style.top    = `${AbstractButton.imgMargin}px`;

            // img.style.width  = `${pixel(data.width)  - 2 * AbstractButton.imgMargin}px`;
            // img.style.height = `${pixel(data.height) - 2 * AbstractButton.imgMargin}px`;
            img.style.width   = "100%";
            img.style.height  = "100%";
        
            this.button.append(img);    
        }
    }
}

export class Button extends AbstractButton {
    click? : MouseEventCallback;

    constructor(data : Attr & { value? : string, text? : string, url? : string, click? : MouseEventCallback }){        
        super(data);
        this.click = data.click;

        this.button.addEventListener("click", async (ev:MouseEvent)=>{
            if(this.click != undefined){
                await this.click(ev);
            }
        });
    }

    html() : HTMLElement {
        return this.button;
    }
}

export class Anchor extends UI {
    anchor : HTMLAnchorElement;

    constructor(data : Attr & { text? : string, url? : string }){
        super(data);

        this.anchor = document.createElement("a");
    }

    html() : HTMLElement {
        return this.anchor;
    }
}

export class RadioButton extends AbstractButton {
    constructor(data : Attr & { value : string, title : string, text? : string, url? : string }){
        super(data);

        this.button.value = data.value;
        this.button.title = data.title;
        this.button.style.borderWidth = "3px";
        this.button.style.borderStyle = "outset";
    }

    html() : HTMLElement {
        return this.button;
    }

    selectUI(selected : boolean){
        if(this.parent == undefined){
            throw new MyError();
        }
        
        if(this.parent.selectedUI != undefined){
            const old_selected = this.parent.selectedUI;
            this.parent.selectedUI = undefined;
            old_selected.selectUI(false);
        }

        const html = this.html();
        if(selected){

            html.style.borderStyle = "inset";

            if(this.parent.selectedUI != this){

                this.parent.selectedUI = this;
                if(this.parent.onChange != undefined){
                    this.parent.onChange(this);
                }
            }
        }
        else{

            html.style.borderStyle = "outset";
        }
    }
}

export class Block extends UI {
    div : HTMLDivElement;
    children : UI[];
    selectedUI? : UI;

    onChange? : (ui:UI)=>void;

    constructor(data : Attr & { children : UI[] }){        
        super(data);
        this.div = document.createElement("div");
        this.div.style.position = "absolute";

        this.children = [];
        data.children.forEach(x => this.addChild(x));

        if(this.children.length != 0 && this.children[0] instanceof RadioButton){
            this.children[0].selectUI(true);
        }

        this.children.forEach(x => this.div.append(x.html()));
    }

    html() : HTMLElement {
        return this.div;
    }

    addChild(child : UI){
        child.parent = this;
        this.children.push(child);

        this.div.append(child.html());

        if(child instanceof RadioButton){

            child.button.addEventListener("click", (ev:MouseEvent)=>{
                child.selectUI(true);                
            });
        }
    }

    popChild(){
        if(this.children.length == 0){
            return;
        }

        const child = this.children.pop()!;
        child.parent = undefined;

        this.div.removeChild(child.html());
    }

    getAllUI() : UI[] {
        let uis : UI[] = [ this ];
        for(const child of this.children){
            if(child instanceof Block){
                uis = uis.concat(child.getAllUI());
            }
            else{
                uis.push(child);
            }
        }

        return uis;
    }

    getAllHtml() : HTMLElement[] {
        const uis = this.getAllUI();
        return uis.map(x => x.html());
    }

    getElementById(id : string) : HTMLElement | undefined {
        return this.getAllHtml().find(x => x.id == id);
    }

    getUIById(id : string) : UI | undefined {
        const uis = this.getAllUI();
        return uis.find(x => x.id == id);
    }

    clear(){
        this.children = [];
        this.div.innerHTML = "";
    }
}

export class Flex extends Block {
    static initialWidth = "300px";
    static padding = 2;

    direction : string;

    constructor(data : Attr & { direction?: string, children : UI[] }){
        super(data);
        this.div.style.width = Flex.initialWidth;

        this.direction = (data.direction != undefined ? data.direction : "row");
        this.children = data.children;

        this.children.forEach(x => this.div.append(x.html()));
    }

    layout(x : number, y : number, width : number, height : number){
        const child_widths  = this.children.map(x => x.getWidth());
        const child_heights = this.children.map(x => x.getHeight());

        let width_auto  : number;
        let height_auto : number;
        let child_x = Flex.padding;
        let child_y = Flex.padding;
        if(this.direction == "row"){

            for(const [idx, child] of this.children.entries()){
                child.layout(child_x, child_y, child_widths[idx], child_heights[idx]);

                child_x += child_widths[idx] + Flex.padding;
            }

            width_auto  = child_x;
            height_auto = Math.max(...child_heights)+ 2 * Flex.padding;
        }
        else if(this.direction == "column"){
            if(!isNaN(width)){
                const max_width = Math.max(... child_widths);
                child_x = 0.5 * (width - max_width);
                if(child_x == -100){
                    const child_widths_2  = this.children.map(x => x.getWidth());
                    console.log("child_x == -100");
                }
                child_x = Math.max(0, child_x);
            }

            for(const [idx, child] of this.children.entries()){
                // msg(`flex y:${child_y} h:${child_heights[idx]} pad:${Flex.padding}`)
                child.layout(child_x, child_y, child_widths[idx], child_heights[idx]);

                child_y += child_heights[idx] + Flex.padding;
            }

            width_auto  = Math.max(...child_widths) + 2 * Flex.padding;
            height_auto = child_y;
        }
        else{
            throw new MyError();
        }

        if(isNaN(width) || isNaN(height)){

            super.layout(x, y, width_auto, height_auto);
        }
        else{

            super.layout(x, y, width, height);
        }
    }
}

export class PopupMenu extends UI {
    dlg  : HTMLDialogElement;
    flex : Flex;
    click? : (index : number, id? : string, value? : string)=>void;

    constructor(data : Attr & { children : UI[], click? : (index : number)=>void }){
        super(data);
        this.click = data.click;

        this.dlg = document.createElement("dialog");
        this.dlg.style.position = "fixed";
        this.dlg.style.zIndex  = "1";


        this.flex = $flex({
            direction : "column",
            children : data.children
        });

        for(const child of data.children){
            child.html().addEventListener("click", (ev : MouseEvent)=>{
                const dlgs = document.body.getElementsByTagName("dialog");
                for(const dlg of dlgs){

                    dlg.close();
                }
            })
        }

        this.dlg.append(this.flex.div);

        document.body.append(this.dlg);
    }

    html(): HTMLElement {
        return this.dlg;
    }

    show(ev : MouseEvent){
        setTimeout(()=>{
            this.flex.layout(0, 0, NaN, NaN);

            this.dlg.style.width  = `${this.flex.width_px}px`;
            this.dlg.style.height = `${this.flex.height_px}px`;
    
            this.dlg.style.marginLeft = `${ev.pageX}px`;
            this.dlg.style.marginTop  = `${ev.pageY}px`;
    
        });
        this.dlg.showModal();
    }

    close(){        
        this.dlg.close();
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
        let child_x = 0;
        let child_y = 0;
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

export class Dialog extends UI {
    dlg : HTMLDialogElement;
    content : UI;
    grid : Grid;
    okClick? : MouseEventCallback;

    constructor(data : Attr & { content : UI, okClick? : MouseEventCallback }){
        super(data);
        if(data.width == undefined || data.height == undefined){
            throw new MyError();
        }
        this.content = data.content;
        this.okClick = data.okClick;

        this.dlg = document.createElement("dialog");
        this.dlg.style.position = "fixed";
        this.dlg.style.zIndex  = "1";

        const ok_button = $button({
            text : "OK",
            click : async (ev:MouseEvent)=>{
                if(this.okClick != undefined){
                    this.okClick(ev);
                }
                this.dlg.close();
            }
        });

        const cancel_button = $button({
            text : "Cancel",
            click : async (ev:MouseEvent)=>{
                this.dlg.close();
            }
        });

        this.grid = $grid({
            rows : "100% 50px",
            children : [
                this.content,
                $flex({
                    children : [
                        ok_button,
                        cancel_button        
                    ]
                })
            ]
        });

        this.dlg.append(this.grid.div);
        document.body.append(this.dlg);
    }

    html() : HTMLElement {
        return this.dlg;
    }

    setXY(x : number, y : number){
        this.x_px = x;
        this.y_px = y;

        this.dlg.style.marginLeft = `${x}px`;
        this.dlg.style.marginTop  = `${y}px`;
    }

    showStyle(ev : MouseEvent){
        const width = pixel(this.width!);
        const height = pixel(this.height!);

        this.grid.layout(0, 0, width, height);

        msg(`dlg: ${width} ${height} ${ev.pageX} ${ev.pageY}`)
        this.dlg.style.width  = `${width}px`;
        this.dlg.style.height = `${height}px`;

        this.dlg.style.marginLeft = `${ev.pageX}px`;
        this.dlg.style.marginTop  = `${ev.pageY}px`;
    }

    open() : boolean {
        return this.dlg.open;
    }

    close(){
        this.dlg.close();
    }

    show(ev : MouseEvent){
        this.dlg.show();
        this.showStyle(ev);
    }

    toggleShow(ev : MouseEvent){
        if(this.dlg.open){
            this.dlg.close();
        }
        else{
            this.show(ev);
        }
    }

    showModal(ev : MouseEvent){
        setTimeout(()=>{
            // getBoundingClientRect can be used after showModal

            this.showStyle(ev);
        })
        this.dlg.showModal();
    }

    getAllUI() : UI[] {
        let uis : UI[] = [ this ];
        return uis.concat(this.grid.getAllUI());
    }

    getUIById(id : string) : UI | undefined {
        return this.getAllUI().find(x => x.id == id);
    }
}

export class Log extends UI {
    static one : Log;

    dlg : HTMLDialogElement;
    pre : HTMLPreElement;
    texts : string = "";
    lastText : string = "";
    count : number = 0;

    static init(){
        if(Log.one == undefined){
            Log.one = new Log({ width : `${0.5 * window.innerWidth}px`, height : `${0.5 * window.innerHeight}px` });
        }
    }

    static log(text : string){
        Log.init();
        Log.one.addText(text);
        console.log(text);
    }

    static show(ev : MouseEvent){
        if(Log.one.dlg.open){

            Log.one.dlg.close();
        }
        else{

            Log.init();

            Log.one.dlg.style.marginTop = `${(window.innerHeight - Log.one.height_px) - 20}px`;
            Log.one.dlg.show();
        }
    }

    constructor(data : Attr){
        super(data);
        if(data.width == undefined || data.height == undefined){
            throw new MyError();
        }

        this.width_px  = pixel(data.width);
        this.height_px = pixel(data.height);

        this.dlg = document.createElement("dialog");
        this.dlg.style.position = "fixed";
        this.dlg.style.width  = `${this.width_px}px`;
        this.dlg.style.height = `${this.height_px}px`;
        this.dlg.style.padding = "0";
        this.dlg.style.marginRight  = "0";
        this.dlg.style.zIndex = "1";

        const div = document.createElement("div");
        div.style.width  = "100%";
        div.style.height = "100%";
        div.style.overflow = "auto"
        div.style.padding = "0";

        this.pre = document.createElement("pre");
        this.pre.style.width  = "100%";
        this.pre.style.height = "100%";

        div.append(this.pre);
        this.dlg.append(div);
        document.body.append(this.dlg);
    }

    html() : HTMLElement {
        return this.dlg;
    }

    addText(text : string){
        if(text == this.lastText){
            if(text != ""){

                this.count++;
    
                this.pre.innerText = this.texts + `\n${this.count}:` + text;    
            }
        }
        else{
            this.texts += "\n" + this.lastText;
            this.lastText = text;

            this.pre.innerText = this.texts + "\n" + text;

            this.count = 1;
        }
    }
}

export function saveBlob(anchor : Anchor, name : string, blob : Blob){
    // a 要素の href 属性に Object URL をセット
    anchor.anchor.href = window.URL.createObjectURL(blob);
    
    // a 要素の download 属性にファイル名をセット
    anchor.anchor.download = `${name}.json`;
    
    // 疑似的に a 要素をクリックさせる
    anchor.anchor.click();

}

export function $label(data : Attr & { text : string }) : Label {
    return new Label(data).setStyle(data) as Label;
}

export function $input_text(data : Attr & { text : string, change? : EventCallback }) : InputText {
    return new InputText(data).setStyle(data) as InputText;
}

export function $input_color(data : Attr & { text : string, change? : EventCallback }) : InputColor {
    return new InputColor(data).setStyle(data) as InputColor;
}

export function $input_number(data : Attr & { value? : number, step? : number, min? : number, max? : number, change? : EventCallback }) : InputNumber {
    return new InputNumber(data).setStyle(data) as InputNumber;
}

export function $checkbox(data : Attr & { text : string, change? : EventCallback }) : CheckBox {
    return new CheckBox(data).setStyle(data) as CheckBox;
}

export function $textarea(data : Attr & { value? : string, cols : number, rows : number, change? : EventCallback }) : TextArea {
    return new TextArea(data).setStyle(data) as TextArea;
}

export function $img(data : Attr) : Img {
    return new Img(data).setStyle(data) as Img;
}

export function $button(data : Attr & { value? : string, text? : string, url? : string, click? : MouseEventCallback }) : Button {
    return new Button(data).setStyle(data) as Button;
}

export function $anchor(data : Attr & { text? : string, url? : string }) : Anchor {
    return new Anchor(data).setStyle(data) as Anchor;
}

export function $radio(data : Attr & { value : string, title : string, text? : string, url? : string }) : RadioButton {
    return new RadioButton(data).setStyle(data) as RadioButton;
}

export function $block(data : Attr & { children : UI[] }) : Block {
    return new Block(data).setStyle(data) as Block;
}

export function $grid(data : Attr & { columns?: string, rows? : string, children : UI[] }) : Grid {
    return new Grid(data).setStyle(data) as Grid;
}

export function $flex(data : Attr & { direction?: string, children : UI[] }) : Flex {
    return new Flex(data).setStyle(data) as Flex;
}

export function $popup(data : Attr & { direction?: string, children : UI[], click? : (index : number, id? : string, value? : string)=>void }) : PopupMenu {
    return new PopupMenu(data).setStyle(data) as PopupMenu;
}

export function $dialog(data : Attr & { content : UI, okClick? : MouseEventCallback }) : Dialog {
    return new Dialog(data).setStyle(data) as Dialog;
}

export function initLayout(root : Grid){
    document.body.append(root.div);
    root.resize();

    window.addEventListener("resize", root.resize.bind(root));
}

}