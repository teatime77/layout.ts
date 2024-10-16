namespace layout_ts {
//
type MouseEventCallback = (ev : MouseEvent)=>void;

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

    setWidth(width : number){
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

    select(selected : boolean){
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

export abstract class AbstractText extends UI {
    fontName? : string;
    fontSize? : string;
}

export class Label extends AbstractText {
    span : HTMLSpanElement;

    constructor(data : Attr){        
        super(data);
        this.span = document.createElement("span");
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
    }

    html() : HTMLElement {
        return this.input;
    }
}

export class TextArea extends UI {
    textArea : HTMLTextAreaElement;

    constructor(data : Attr & { value? : string, cols : number, rows : number }){
        super(data);
        this.textArea = document.createElement("textarea");
        if(data.value != undefined){
            this.textArea.value = data.value;
        }

        this.textArea.cols = data.cols;
        this.textArea.rows = data.rows;
    }

    html() : HTMLElement {
        return this.textArea;
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
    button : HTMLButtonElement;    

    constructor(data : Attr & { text? : string, url? : string }){
        super(data);
        this.button = document.createElement("button");

        if(data.text != undefined){
            this.button.innerText = data.text;
        }

        if(data.url != undefined){
            const img = document.createElement("img");
            img.src = data.url;
    
            if(data.width == undefined || data.height == undefined){
                throw new MyError();
            }

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

    constructor(data : Attr & { text? : string, url? : string, click? : MouseEventCallback }){        
        super(data);
        this.click = data.click;

        this.button.addEventListener("click", (ev:MouseEvent)=>{
            if(this.click != undefined){
                this.click(ev);
            }
        })
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

export class RadioButton extends AbstractButton {
    constructor(data : Attr & { value : string, title : string, text? : string, url? : string }){
        super(data);

        this.button.value = data.value;
        this.button.title = data.title;
        this.button.style.margin      = "2px";
        this.button.style.borderWidth = "1px";
    }

    html() : HTMLElement {
        return this.button;
    }

    select(selected : boolean){
        if(this.parent == undefined){
            throw new MyError();
        }
        
        if(this.parent.selectedUI != undefined){
            const old_selected = this.parent.selectedUI;
            this.parent.selectedUI = undefined;
            old_selected.select(false);
        }

        const html = this.html();
        if(selected){

            html.style.margin      = "1px";
            html.style.borderWidth = "2px";

            if(this.parent.selectedUI != this){

                this.parent.selectedUI = this;
                if(this.parent.onChange != undefined){
                    this.parent.onChange(this);
                }
            }
        }
        else{

            html.style.margin      = "2px";
            html.style.borderWidth = "1px";
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

        this.children = data.children;

        this.children.forEach(x => this.div.append(x.html()));
    }

    html() : HTMLElement {
        return this.div;
    }

    addChild(ui : UI){
        ui.parent = this;
        this.div.append(ui.html());
        this.children.push(ui);
    }

    addRadioButton(radio : RadioButton){
        this.addChild(radio);
        radio.button.addEventListener("click", (ev:MouseEvent)=>{
            radio.select(true);
        });
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
}

export class Flex extends Block {
    static padding = 2;
    direction : string;

    constructor(data : Attr & { direction?: string, children : UI[] }){
        super(data);

        this.direction = (data.direction != undefined ? data.direction : "row");
        this.children = data.children;

        this.children.forEach(x => this.div.append(x.html()));
    }

    layout(x : number, y : number){
        const child_widths  = this.children.map(x => x.getWidth());
        const child_heights = this.children.map(x => x.getHeight());

        let width  : number;
        let height : number;
        let child_x = Flex.padding;
        let child_y = Flex.padding;
        if(this.direction == "row"){

            for(const [idx, child] of this.children.entries()){
                child.layout(child_x, child_y, child_widths[idx], child_heights[idx]);

                child_x += child_widths[idx] + Flex.padding;
            }

            width  = child_x;
            height = Math.max(...child_heights)+ 2 * Flex.padding;
        }
        else{

            for(const [idx, child] of this.children.entries()){
                child.layout(child_x, child_y, child_widths[idx], child_heights[idx]);

                child_y += child_heights[idx] + Flex.padding;
            }

            width  = Math.max(...child_widths) + 2 * Flex.padding;
            height = child_y;
        }

        super.layout(x, y, width, height);
    }
}

export class PopupMenu extends Flex {
    constructor(data : Attr & { direction?: string, children : UI[] }){
        super(data);
        document.body.append(this.div);
        this.div.style.display = "none";
        this.div.style.zIndex  = "1";
    }

    show(ev : MouseEvent){
        this.div.style.display = "inline-block";
        this.layout(ev.pageX, ev.pageY);
    }

    close(){        
        this.div.style.display = "none";
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

        const ok_button = $button({
            text : "OK",
            click : (ev:MouseEvent)=>{
                if(this.okClick != undefined){
                    this.okClick(ev);
                }
                this.dlg.close();
            }
        });

        const cancel_button = $button({
            text : "Cancel",
            click : (ev:MouseEvent)=>{
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

    show(ev : MouseEvent){
        this.dlg.show();
        this.showStyle(ev);
    }

    showModal(ev : MouseEvent){
        setTimeout(()=>{
            // getBoundingClientRect can be used after showModal

            this.showStyle(ev);
        })
        this.dlg.showModal();
    }
}

export function $label(data : Attr) : Label {
    return new Label(data).setStyle(data) as Label;
}

export function $text(data : Attr) : Text {
    return new Text(data).setStyle(data) as Text;
}

export function $textarea(data : Attr & { value? : string, cols : number, rows : number }) : TextArea {
    return new TextArea(data).setStyle(data) as TextArea;
}

export function $img(data : Attr) : Img {
    return new Img(data).setStyle(data) as Img;
}

export function $button(data : Attr & { text? : string, url? : string, click? : MouseEventCallback }) : Button {
    return new Button(data).setStyle(data) as Button;
}

export function $checkbox(data : Attr & { text : string }) : CheckBox {
    return new CheckBox(data).setStyle(data) as CheckBox;
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

export function $popup(data : Attr & { direction?: string, children : UI[] }) : PopupMenu {
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