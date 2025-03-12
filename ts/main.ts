namespace layout_ts {
//
type MouseEventCallback = (ev : MouseEvent)=>Promise<void>;
type EventCallback = (ev : Event)=>Promise<void>;

export const fgColor = "white";
export const bgColor = "#003000";
// export const bgColor = "black";

export let modalDlg : HTMLDivElement;

const AppMode = i18n_ts.AppMode;

export async function bodyOnLoad(){
    await i18n_ts.initI18n();

    const root = makeTestUI();
    Layout.initLayout(root);
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

enum Orientation {
    horizontal,
    vertical,
}

export interface Attr {
    id? : string;
    className? : string;
    parent? : Block;
    obj? : any;
    name? : string;
    position? : string;
    margin? : string;
    color? : string;
    backgroundColor? : string;
    borderStyle? : string;
    borderWidth? : number;
    padding? : number;
    paddingLeft? : string;
    verticalAlign? : string;
    horizontalAlign? : string;
    textAlign? : string;
    fontSize? : string;
    colspan? : number;
    width? : string;
    height? : string;
    disabled? : boolean;
    visibility? : string;
}

export abstract class UI {
    static count : number = 0;

    idx : number;
    id? : string;
    className? : string;
    parent? : Block;
    obj? : any;
    name? : string;
    position? : string;
    margin? : string;
    color? : string;
    backgroundColor? : string;
    borderStyle? : string;
    borderWidth? : number;
    padding? : number;
    paddingLeft? : string;
    verticalAlign? : string;
    horizontalAlign? : string;
    textAlign? : string;
    fontSize? : string;
    width? : string;
    height? : string;
    visibility? : string;
    colspan : number = 1;

    minSize : Vec2 | undefined;
    widthPix  : number = NaN;
    heightPix : number = NaN;

    constructor(data : Attr){   
        Object.assign(this, data);
        this.idx = ++UI.count;
    }

    setStyle() : UI {
        const ele = this.html();

        if(this.id != undefined){
            ele.id = this.id;
        }

        if(this.className != undefined){
            ele.className = this.className;
        }

        if(this.position != undefined){
            ele.style.position = this.position;
        }
        else if(!(ele instanceof Dialog) ){
            ele.style.position = "absolute";
        }

        if(this.margin != undefined){
            ele.style.margin = this.margin;
        }

        if(this.borderWidth != undefined){
            ele.style.borderWidth = `${this.borderWidth}`;
        }

        if(this.borderStyle != undefined){
            ele.style.borderStyle = this.borderStyle;
        }

        if(this.padding != undefined){
            ele.style.padding = `${this.padding}px`;
        }

        if(this.textAlign != undefined){
            ele.style.textAlign = this.textAlign;
        }

        if(this.fontSize != undefined){
            ele.style.fontSize = this.fontSize;
        }

        if(this.color != undefined){
            ele.style.color = this.color;
        }

        if(this.backgroundColor != undefined){
            ele.style.backgroundColor = this.backgroundColor;
        }
        else{
            ele.style.backgroundColor = bgColor;
        }

        if(this.width != undefined){
            ele.style.width = this.width;
        }

        if(this.height != undefined){
            ele.style.height = this.height;
        }

        if(this.visibility != undefined){
            ele.style.visibility = this.visibility;
        }

        return this;
    }

    abstract html() : HTMLElement;

    borderWidthPadding() : number {
        let n : number = 0;
        
        if(this.borderWidth != undefined){
            n += 2 * this.borderWidth;
        }

        if(this.padding != undefined){
            n += 2 * this.padding;
        }

        return n;
    }

    getMinSize() : Vec2 {
        if(this.minSize != undefined){
            return this.minSize;
        }

        let width : number | undefined;
        let height : number | undefined;

        if(this.width != undefined && this.width.endsWith("px")){
            width = pixel(this.width) + this.borderWidthPadding();
        }

        if(this.height != undefined && this.height.endsWith("px")){
            height = pixel(this.height) + this.borderWidthPadding();
        }

        if(width == undefined || height == undefined){

            let size : Vec2;
            
            if(this instanceof AbstractText){
                size = this.getTextSize();
            }
            else{
                const rect = this.html().getBoundingClientRect();
                size = new Vec2(rect.width, rect.height);
           }

            if(width == undefined){
                width = size.x;
            }
            if(height == undefined){
                height = size.y;
            }
        }

        this.minSize = new Vec2(width, height);
        return this.minSize;
    }

    getMinWidth() : number {
        return this.getMinSize().x;
    }


    getMinHeight() : number {
        return this.getMinSize().y;
    }

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
        const html = this.html();

        if(this.position != "static"){
            html.style.left = `${x}px`;
            html.style.top  = `${y}px`;
        }
    }

    setSize(size : Vec2){
        if(size == undefined){
            throw new MyError();
        }
        const html = this.html();

        const borderWidthPadding = this.borderWidthPadding();

        if(this.minSize == undefined){
            throw new MyError();
        }

        if(this.width != undefined){
            this.widthPix  = this.minSize.x;
        }
        else{
            this.widthPix  = size.x - borderWidthPadding;
        }

        if(this.height != undefined){
            this.heightPix = this.minSize.y;
        }
        else{
            this.heightPix = size.y - borderWidthPadding;
        }

        html.style.width  = `${this.widthPix}px`;
        html.style.height = `${this.heightPix}px`;
    }

    selectUI(selected : boolean){
    }

    layout(x : number, y : number, size : Vec2, nest : number){
        if(i18n_ts.appMode == AppMode.lessonPlay){            
            msg(`${" ".repeat(4 * nest)} id:${this.constructor.name} x:${x.toFixed()} y:${y.toFixed()} position:${this.position} ${this.html().style.position}`);
        }

        this.setSize(size);
        if(this.horizontalAlign == "center"){
            x += 0.5 * (size.x - this.widthPix);
        }
        this.setXY(x, y);
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

    constructor(data : Attr & { text : string }){
        super(data);
        this.text = data.text;
    }

    setText(text : string){
        this.text = text;
    }

    getTextSize() : Vec2 {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;

        const style = window.getComputedStyle(this.html());
        const font_info = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
        ctx.font = font_info;

        const metrics = ctx.measureText(this.text);
      
        const actualHeight = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
      
        // msg(`font :[${font_info}]  w:[${metrics.width}] h:[${actualHeight}] id:[${this.id}] [${this.text}]`);

        const width  = metrics.width + this.borderWidthPadding();
        const height = actualHeight  + this.borderWidthPadding();
        return new Vec2(width, height);
    }
}

export class Label extends AbstractText {
    span : HTMLSpanElement;

    constructor(data : Attr & { text : string }){        
        super(data);

        this.span = document.createElement("span");
        this.span.innerText = this.text;
        // this.span.style.justifyContent = "center";
        // this.span.style.textAlign = "center";
    }

    html() : HTMLElement {
        return this.span;
    }
}

export abstract class TextDiv extends AbstractText {
    div : HTMLDivElement;

    constructor(data : Attr & { text : string }){
        super(data);
        this.div = document.createElement("div");
        // this.div.style.borderStyle = "ridge";
        // this.div.style.borderWidth = "3px";
        // this.div.style.borderColor = "transparent";
    }

    html() : HTMLElement {
        return this.div;
    }

    show(){
        this.div.style.display = "";
    }

    hide(){
        this.div.style.display = "none";
    }

    setBorderColor(color : string){
        this.div.style.borderColor = color;
    }
}

export class TextBox extends TextDiv {
    constructor(data : Attr & { text : string }){
        super(data);
        this.div.innerHTML = data.text;
    }

    setText(text : string){
        super.setText(text);
        this.div.innerHTML = text;
    }

    clearText(){
        this.setText("");
    }
}

export class LaTeXBox extends TextDiv {
    click? : MouseEventCallback;

    constructor(data : Attr & { text : string, click? : MouseEventCallback }){        
        super(data);
        this.click = data.click;

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

    setText(text : string){
        super.setText(text);
        parser_ts.renderKatexSub(this.div, this.text);
    }
}

abstract class AbstractInput extends UI {
    input : HTMLInputElement;
    change? : (ev : Event)=>Promise<void>;

    constructor(data : Attr & { change? : EventCallback }){
        super(data);
        this.change = data.change;

        this.input = document.createElement("input");
        this.input.style.color = fgColor;

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

class InputNumberRange extends AbstractInput {
    constructor(data : Attr & { value? : number, step? : number, min? : number, max? : number, change? : EventCallback }){
        super(data);
        
        if(data.width == undefined){
            data.width = "50px";
        }

        if(this instanceof InputNumber){

            this.input.type = "number";
        }
        else{

            this.input.type = "range";
        }

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

    setValue(value : number){
        this.input.value = `${value}`;
    }

    getValue() : number {
        return parseFloat(this.input.value);
    }

    setMax(max_value : number){
        this.input.max = `${max_value}`;        
    }
}

export class InputNumber extends InputNumberRange {
}


export class InputRange extends InputNumberRange {
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
        label.style.color = fgColor;

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

    constructor(data : Attr & { value? : string, cols? : number, rows? : number, placeholder? : string, change? : EventCallback }){
        super(data);
        this.change = data.change;
        this.textArea = document.createElement("textarea");
        if(data.value != undefined){
            this.textArea.value = data.value;
        }

        if(data.cols != undefined){
            this.textArea.cols = data.cols;
        }

        if(data.rows != undefined){
            this.textArea.rows = data.rows;
        }

        this.textArea.style.color = fgColor;

        if(data.placeholder != undefined){
            this.textArea.placeholder = data.placeholder;
        }

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

    setValue(text : string){
        this.textArea.value = text;
    }
}

export class Img extends UI {
    imgUrl : string;
    img : HTMLImageElement;
    click? : MouseEventCallback;

    constructor(data : Attr & { imgUrl : string, file? : File, click? : MouseEventCallback }){
        super(data);
        this.imgUrl = data.imgUrl;
        this.img = document.createElement("img");
        this.img.style.objectFit = "contain";
        if(data.file != undefined){

            setImgFile(this.img, data.file);
        }
        else{

            this.img.src = this.imgUrl;
        }

        if(data.click != undefined){
            this.click = data.click;

            this.img.addEventListener("click", async (ev:MouseEvent)=>{
                if(this.click != undefined){
                    await this.click(ev);
                }
            });
        }
    }

    html() : HTMLElement {
        return this.img;
    }

    setImgUrl(url : string){
        this.img.src = url;
        this.imgUrl  = url;
    }
}

abstract class AbstractButton extends UI {
    static imgMargin = 2;

    value?  : string;
    button : HTMLButtonElement;
    img? : HTMLImageElement;

    constructor(data : Attr & { id? : string, value? : string, text? : string, url? : string }){
        super(data);
        this.value = data.value;
        this.button = document.createElement("button");
        this.button.style.padding = "1px";
        this.button.style.color = fgColor;

        if(data.disabled != undefined && data.disabled){
            this.button.disabled = true;
        }

        if(data.text != undefined){
            this.button.innerText = data.text;
        }

        if(data.url != undefined){
            this.img = document.createElement("img");
            this.img.src = data.url;
    
            this.img.style.width   = "100%";
            this.img.style.height  = "100%";
            this.img.style.objectFit = "contain";
        
            this.button.append(this.img);    
        }
    }

    setImgUrl(url : string){
        this.img!.src = url;
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
    constructor(data : Attr & { id? : string, value : string, title? : string, text? : string, url? : string }){
        super(data);

        this.button.value = data.value;
        if(data.title != undefined){
            this.button.title = data.title;
        }
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

    removeChild(child : UI){
        const idx = this.children.indexOf(child);
        if(idx == -1){
            throw new MyError();
        }

        this.children.splice(idx, 1);
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

    $(id : string){
        return this.getUIById(id);
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

    getMinSize() : Vec2 {
        let min_sizes : Vec2[] = [];

        if(this.children.length != 0){
            min_sizes = this.children.map(x => x.getMinSize());
        }

        let width : number | undefined;
        let height : number | undefined;

        if(this.width != undefined){
            assert(this.width.endsWith("px"));
            width = pixel(this.width);
        }
        else{
            if(this.children.length == 0){
                width = 0;
            }
            else if(this.direction == "row"){
                width = sum( min_sizes.map(sz => sz.x) ) + (min_sizes.length - 1) * Flex.padding;
            }
            else if(this.direction == "column"){
                width  = Math.max(...min_sizes.map(sz => sz.x));
            }
        }

        if(this.height != undefined){
            assert(this.height.endsWith("px"));
            height = pixel(this.height);
        }
        else{
            if(this.children.length == 0){
                height = 0;
            }
            else if(this.direction == "row"){
                height = Math.max(...min_sizes.map(sz => sz.y));
            }
            else if(this.direction == "column"){
                height = sum( min_sizes.map(sz => sz.y) ) + (min_sizes.length - 1) * Flex.padding;
            }
        }

        if(width == undefined || height == undefined){
            throw new MyError();
        }   

        this.minSize = new Vec2(width + 2 * Flex.padding, height + 2 * Flex.padding);

        return this.minSize;
    }

    layout(x : number, y : number, size : Vec2, nest : number){
        super.layout(x, y, size, nest);

        let child_x = Flex.padding;
        let child_y = Flex.padding;
        if(this.direction == "row"){

            for(const [idx, child] of this.children.entries()){
                child.layout(child_x, child_y, child.getMinSize(), nest + 1);

                child_x += child.minSize!.x + Flex.padding;
            }
        }
        else if(this.direction == "column"){

            for(const [idx, child] of this.children.entries()){
                child.layout(child_x, child_y, child.getMinSize(), nest + 1);

                child_y += child.minSize!.y + Flex.padding;
            }
        }
        else{
            throw new MyError();
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
            this.flex.getAllUI().forEach(x => x.minSize = undefined);

            const size = this.flex.getMinSize();
            this.flex.layout(0, 0, size, 0);

            this.dlg.style.width  = `${size.x}px`;
            this.dlg.style.height = `${size.y}px`;
    
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
    columns? : string[];
    rows? : string[];

    minWidths : number[] = [];
    heights! : number[];

    numCols : number = NaN;
    numRows : number = NaN;

    constructor(data : Attr & { columns?: string, rows? : string, children : UI[] }){        
        super(data);
        if(data.columns != undefined){

            this.columns = data.columns.split(" ");
        }

        if(data.rows != undefined){

            this.rows = data.rows.split(" ");
        }
    }

    getRow(idx : number) : UI[] {
        assert(!isNaN(this.numCols) && !isNaN(this.numRows));
        return this.children.slice(idx * this.numCols, (idx + 1) * this.numCols);
    }

    getRowHeight(idx : number) : number {
        return Math.max(... this.getRow(idx).map(ui => ui.getMinHeight()));
    }

    getColumn(idx : number) : UI[]{
        assert(!isNaN(this.numCols) && !isNaN(this.numRows));
        return range(this.children.length).filter(i => i % this.numCols == idx).map(i => this.children[i]);
    }

    getColumnWith(idx : number) : number {
        return Math.max(... this.getColumn(idx).map(ui => ui.getMinWidth()));
    }

    calcHeights(){
        const heights = range(this.rows!.length).map(x => 0);
        for(const [idx, row] of this.rows!.entries()){
            if(row.endsWith("px")){
                heights[idx] = pixel(row);
            }
            else if(row == "auto"){
                heights[idx] = this.getRowHeight(idx);
            }
        }

        return heights;
    }

    getMinSize() : Vec2 {
        let width : number;

        this.numCols = (this.columns == undefined ? 1 : this.columns.length);
        this.numRows = Math.ceil(this.children.length / this.numCols);
        assert(this.rows == undefined || this.rows.length == this.numRows);

        if(this.width != undefined){
            assert(this.width.endsWith("px"));
            width = pixel(this.width);
        }
        else{

            if(this.columns == undefined){

                width = this.getColumnWith(0);
            }
            else{
                this.minWidths = new Array(this.columns.length).fill(0);

                for(const [idx, col] of this.columns.entries()){
                    if(col.endsWith("px")){
                        this.minWidths[idx] = pixel(col);
                    }
                    else{
                        const col_width = Math.max(... this.getColumn(idx).map(ui => ui.getMinWidth()) );
                        if(col == "auto"){
                            this.minWidths[idx] = col_width;
                        }
                        else if(col.endsWith("%")){
                            this.minWidths[idx] = col_width / ratio(col);
                        }
                        else{
                            throw new MyError();
                        }
                    }
                }

                width = sum(this.minWidths);
            }
        }

        let height : number;

        if(this.height != undefined){
            assert(this.numRows == 1);
            assert(this.height.endsWith("px"));
            height = pixel(this.height);
            this.heights = [ height ];
        }
        else{

            if(this.rows == undefined){
                this.heights = range(this.numRows).map(i => this.getRowHeight(i) );
                height = sum( this.heights ) ;
            }
            else{

                this.heights = this.calcHeights();

                let remaining_height = 0;
                for(const [idx, size] of this.rows.entries()){
                    if(size.endsWith("%")){

                        const row_height = Math.max(... this.getRow(idx).map(ui => ui.getMinHeight()) );
                        remaining_height = Math.max(row_height / ratio(size));
                    }
                }

                height = sum(this.heights) + remaining_height;
            }
        }

        this.minSize = new Vec2(width, height);
        return this.minSize;
    }

    layout(x : number, y : number, size : Vec2, nest : number){
        super.layout(x, y, size, nest);

        let widths = new Array(this.minWidths.length).fill(0);

        if(this.columns == undefined){
            widths = [ size.x ];
        }
        else{
            let fixed_width = 0;
            for(const [idx, col] of this.columns.entries()){
                if(col.endsWith("px") || col == "auto"){
                    widths[idx]  = this.minWidths[idx];
                    fixed_width += this.minWidths[idx];
                }
            }

            const remaining_width = size.x - fixed_width;
            for(const [idx, col] of this.columns.entries()){
                if(col.endsWith("%")){
                    widths[idx]  = remaining_width * ratio(col);
                }
            }
        }


        if(this.rows == undefined){
            this.heights = range(this.numRows).map(i => this.getRowHeight(i) );
        }
        else{
            if(this.heights == undefined){
                this.heights = this.calcHeights();
            }
            
            const remaining_height = size.y - sum(this.heights);
            for(const [idx, row] of this.rows.entries()){

                if(row.endsWith("%")){

                    this.heights[idx] = pixel(row, remaining_height);
                }
            }
        }

        if(i18n_ts.appMode == AppMode.lessonPlay){
            msg(`${" ".repeat(4 * nest)} id:${this.id} widths:${widths.map(x => x.toFixed())} heights:${this.heights.map(x => x.toFixed())}`);
        }

        let row = 0;
        let col_idx = 0;
        let child_x = 0;
        let child_y = 0;
        for(const child of this.children){
            let child_width : number;
            if(child.colspan == 1){
                child_width = widths[col_idx];
            }
            else{
                child_width = sum(widths.slice(col_idx, col_idx + child.colspan))
            }

            child.layout(child_x, child_y, new Vec2(child_width, this.heights[row]), nest + 1 );

            if(col_idx + child.colspan < widths.length){

                child_x += widths[col_idx];
                col_idx += child.colspan;
            }
            else{
                child_x   = 0;
                child_y += this.heights[row];

                col_idx = 0;
                row++;
            }
        }
    }  


    updateRootLayout(){
        this.getAllUI().forEach(x => x.minSize = undefined);
        const size = this.getMinSize();

        let x : number;
        let y : number;

        if(this.columns != undefined && this.columns.some(x => x.endsWith("%"))){

            size.x = window.innerWidth;
            x = 0;
        }
        else{

            x = Math.max(0, 0.5 * (window.innerWidth  - size.x));
        }

        if(this.rows != undefined && this.rows.some(x => x.endsWith("%"))){

            size.y = window.innerHeight;
            y = 0;
        }
        else{

            y = Math.max(0, 0.5 * (window.innerHeight - size.y));
        }

        this.layout(x, y, size, 0);
    }
}

export class SelectionList extends Grid {
    selectedIndex : number = NaN;
    selectionChanged? : (index:number)=>void;

    constructor(data : Attr & { orientation? : Orientation, children : RadioButton[], selectedIndex? : number, selectionChanged? : (index:number)=>void }){
        if(data.orientation == Orientation.vertical){
            (data as any).rows    = data.children.map(_ => "auto").join(" ");
        }
        else{
            (data as any).columns = data.children.map(_ => "auto").join(" ");
        }
        super(data);

        if(data.selectedIndex != undefined){
            this.selectedIndex = data.selectedIndex;
        }

        if(data.selectionChanged != undefined){

            this.selectionChanged = data.selectionChanged;
        }

        for(const [idx, ui] of this.children.entries()){
            ui.html().addEventListener("click", (ev : MouseEvent)=>{
                msg(`selection-Changed[${idx}]`);
                this.selectedIndex = idx;
                if(this.selectionChanged != undefined){
                    this.selectionChanged(idx);
                }
            });
        }
    }

    setStyle() : UI {
        super.setStyle();

        msg(`selected-Index : ${this.selectedIndex}`);
        if(!isNaN(this.selectedIndex)){
            this.children[this.selectedIndex].selectUI(true);
        }

        return this;
    }
}

export class Dialog extends UI {
    div : HTMLDivElement;
    content : UI;

    constructor(data : Attr & { content : UI }){
        super(data);
        this.content = data.content;

        this.div = document.createElement("div");
        this.div.style.position = "fixed";
        this.div.style.zIndex  = "1";

        this.div.append(this.content.html());
    }

    html() : HTMLElement {
        return this.div;
    }

    setXY(x : number, y : number){
        this.div.style.marginLeft = `${x}px`;
        this.div.style.marginTop  = `${y}px`;
    }

    showStyle(pageX : 0, pageY : 0){
        const size = this.content.getMinSize();
        this.content.layout(0, 0, size, 0);

        msg(`dlg: ${size.x} ${size.y} ${pageX} ${pageY}`)
        this.div.style.width  = `${size.x + 10}px`;
        this.div.style.height = `${size.y + 10}px`;

        this.div.style.marginLeft = `${pageX}px`;
        this.div.style.marginTop  = `${pageY}px`;
    }

    open() : boolean {
        return this.div.parentElement == modalDlg;
    }

    close(){
        modalDlg.innerHTML = "";
        modalDlg.style.display = "none";
    }

    showModal(){
    /*
        setTimeout(()=>{
            // getBoundingClientRect can be used after showModal

            this.showStyle(0, 0);
        });
    */
        if(this.div.parentElement != modalDlg){

            modalDlg.append(this.div);
        }

        this.showStyle(0, 0);

        modalDlg.style.display = "block";
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

            Log.one.dlg.style.marginTop = `${0.8 * window.innerHeight}px`;
            Log.one.dlg.show();
        }
    }

    constructor(data : Attr){
        super(data);
        if(data.width == undefined || data.height == undefined){
            throw new MyError();
        }

        const width_px  = pixel(data.width);
        const height_px = pixel(data.height);

        this.dlg = document.createElement("dialog");
        this.dlg.style.position = "fixed";
        this.dlg.style.width  = `${width_px}px`;
        this.dlg.style.height = `${height_px}px`;
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

export class Layout {
    static root : Grid;

    static initLayout(root : Grid){
        Layout.root = root;

        document.body.append(root.div);
        Layout.root.updateRootLayout();
    
        window.addEventListener("resize", (ev : UIEvent)=>{
            Layout.root.updateRootLayout();
        });

        modalDlg = $div("modal_dlg");
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
    return new Label(data).setStyle() as Label;
}

export function $input_text(data : Attr & { text : string, change? : EventCallback }) : InputText {
    return new InputText(data).setStyle() as InputText;
}

export function $input_color(data : Attr & { text : string, change? : EventCallback }) : InputColor {
    return new InputColor(data).setStyle() as InputColor;
}

export function $input_number(data : Attr & { value? : number, step? : number, min? : number, max? : number, change? : EventCallback }) : InputNumber {
    return new InputNumber(data).setStyle() as InputNumber;
}

export function $input_range(data : Attr & { value? : number, step? : number, min? : number, max? : number, change? : EventCallback }) : InputRange {
    return new InputRange(data).setStyle() as InputRange;
}

export function $checkbox(data : Attr & { text : string, change? : EventCallback }) : CheckBox {
    return new CheckBox(data).setStyle() as CheckBox;
}

export function $textarea(data : Attr & { value? : string, cols? : number, rows? : number, placeholder? : string, change? : EventCallback }) : TextArea {
    return new TextArea(data).setStyle() as TextArea;
}

export function $img(data : Attr & { imgUrl : string, file? : File, click? : MouseEventCallback }) : Img {
    return new Img(data).setStyle() as Img;
}

export function $button(data : Attr & { value? : string, text? : string, url? : string, click? : MouseEventCallback }) : Button {
    return new Button(data).setStyle() as Button;
}

export function $anchor(data : Attr & { text? : string, url? : string }) : Anchor {
    return new Anchor(data).setStyle() as Anchor;
}

export function $radio(data : Attr & { id? : string, value : string, title? : string, text? : string, url? : string }) : RadioButton {
    return new RadioButton(data).setStyle() as RadioButton;
}

export function $textbox(data : Attr & { text : string }) : TextBox {
    return new TextBox(data).setStyle() as TextBox;
}

export function $block(data : Attr & { children : UI[] }) : Block {
    return new Block(data).setStyle() as Block;
}

export function $grid(data : Attr & { columns?: string, rows? : string, children : UI[] }) : Grid {
    return new Grid(data).setStyle() as Grid;
}

export function $selection(data : Attr & { orientation? : Orientation, children : RadioButton[], selectedIndex? : number, selectionChanged? : (index:number)=>void }) : SelectionList {
    return new SelectionList(data).setStyle() as SelectionList;
}

export function $flex(data : Attr & { direction?: string, children : UI[] }) : Flex {
    return new Flex(data).setStyle() as Flex;
}

export function $popup(data : Attr & { direction?: string, children : UI[], click? : (index : number, id? : string, value? : string)=>void }) : PopupMenu {
    return new PopupMenu(data).setStyle() as PopupMenu;
}

export function $dialog(data : Attr & { content : UI, okClick? : MouseEventCallback }) : Dialog {
    return new Dialog(data).setStyle() as Dialog;
}

export function $imgdiv(data : Attr & { uploadImgFile : (file : File)=>Promise<string> }) : ImgDiv {
    return new ImgDiv(data).setStyle() as ImgDiv;
}

}