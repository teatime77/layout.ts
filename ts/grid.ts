namespace layout_ts {
//
// const assert  = i18n_ts.assert;
// const msg     = i18n_ts.msg;
const arrayFill = i18n_ts.arrayFill;
const range2  = i18n_ts.range2;
const AUTO = "auto";

function pixel(length : string,  remaining_length? : number) : number {
        throw new Error();
}

function ratio(width : string) : number{
        throw new Error();
}

interface GridAttr extends Attr {
    columns?: string;
    rows?   : string;
    cells : UI[][];
}

abstract class UI {
    width? : string;
    height? : string;
    minSize : Vec2 | undefined;
    colspan : number = 1;
    rowspan : number = 1;

    constructor(data : Attr){        
    }


    getMinWidth() : number {       
        throw new Error();
    }

    getMinHeight() : number {
        throw new Error();
    }

    setMinSize() : void {
    }

    marginBorderPaddingWidth() : number {
        throw new Error();
    }

    marginBorderPaddingHeight() : number {
        throw new Error();
    }

    layout(x : number, y : number, size : Vec2, nest : number){        
    }

    getAllUI() : UI[] {
        throw new Error();
    }

    draw(){}
    dump(nest : number){}

    str() : string {
        throw new Error();
    }

}

class GridNew extends UI {
    colDescs : string[];
    rowDescs   : string[];
    cells : UI[][];

    minWidths : number[] = [];
    minHeights: number[] = [];

    colWidths : number[] = [];
    rowHeights: number[] = [];

    numRows : number;
    numCols : number;

    constructor(data : GridAttr){        
        super(data as any);

        this.cells = data.cells;
        this.numRows = this.cells.length;
        this.numCols = Math.max(... this.cells.map(row => sum(row.map(ui => ui.colspan))));

        if(data.columns == undefined){
            this.colDescs = arrayFill(this.numCols, "auto");
        }
        else{

            this.colDescs = data.columns.split(" ");
        }

        if(data.rows == undefined){

            this.rowDescs = arrayFill(this.numRows, "auto");
        }
        else{

            this.rowDescs = data.rows.split(" ");
        }

        assert(this.colDescs.length == this.numCols);
        assert(this.rowDescs.length   == this.numRows);
    }

    children() : UI[] {
        return this.cells.flat();
    }

    getRow(idx : number) : UI[] {
        return this.cells[idx];
    }

    getRowHeight(idx : number) : number {
        return Math.max(... this.getRow(idx).map(ui => ui.getMinHeight()));
    }

    getColumnWith(col_idx : number) : number {
        let max_width = 0;
        for(const row of this.cells){
            let offset = 0;
            for(const ui of row){
                if(offset == col_idx){
                    if(ui.colspan == 1){
                        max_width = Math.max(max_width, ui.getMinWidth());
                    }
                    break;
                }

                offset += ui.colspan;
                if(col_idx < offset){
                    break;
                }
            }
        }

        return max_width;
    }

    calcHeights(){
        const heights = new Array(this.rowDescs!.length).fill(0);
        for(const [idx, row] of this.rowDescs!.entries()){
            if(row.endsWith("px")){
                heights[idx] = pixel(row);
            }
            else if(row == AUTO){
                heights[idx] = this.getRowHeight(idx);
            }
        }

        return heights;
    }

    setMinSizeSub(is_width : boolean) : void {
        let offset_size_px_ui_spans : [number, number, UI, number][] = [];

        const min_sizes = arrayFill(is_width ? this.numCols : this.numRows, 0);
        for(const [row_idx, row] of this.cells.entries()){
            let offset = 0;
            for(const ui of row){
                let size_px : number;

                const [ui_size, ui_min_size, ui_span] = (is_width ? [ui.width, ui.minSize!.x, ui.colspan] : [ui.height, ui.minSize!.y, ui.rowspan]);
                if(ui_size == undefined){
                    size_px = ui_min_size;
                }
                else{

                    if(ui_size.endsWith("px")){
                        size_px = pixel(ui_size);
                        if(size_px < ui_min_size){
                            throw new MyError();
                        }
                    }
                    else if(ui_size.endsWith("%")){
                        size_px = ui_min_size / ratio(ui_size);
                    }
                    else{
                        throw new MyError();
                    }
                }

                const pos = (is_width ? offset : row_idx);
                if(ui_span == 1){
                    if(min_sizes[pos] < size_px){
                        min_sizes[pos] = size_px;
                    }
                }
                else{
                    offset_size_px_ui_spans.push([pos, size_px, ui, ui_span]);

                }

                offset += ui.colspan;
            }
        }

        let max_remaining_size = 0;

        const descs = (is_width ? this.colDescs : this.rowDescs);
        for(const [offset, width_px, ui, ui_span] of offset_size_px_ui_spans){
            let fixed_px = 0;
            let ratio_sum = 0;
            for(const idx of range2(offset, offset + ui_span)){
                if(descs[idx].endsWith("%")){
                    ratio_sum += ratio(descs[idx]);
                }
                else{
                    fixed_px += min_sizes[idx];
                }
            }

            if(ratio_sum == 0){

                if(fixed_px < ui.minSize!.x){
                    throw new MyError();
                }
            }
            else{
                if(fixed_px <= ui.minSize!.x){
                    const ratio_px = ui.minSize!.x - fixed_px;
                    const remaining_width = ratio_px / ratio_sum;
                    if(max_remaining_size < remaining_width){
                        max_remaining_size = remaining_width;
                    }

                }
                else{
                    throw new MyError();
                }
            }
        }

        for(const [idx, col] of descs.entries()){
            if(col.endsWith("px")){
                min_sizes[idx] = pixel(col);
            }
            else if(col.endsWith("%")){
                min_sizes[idx] = max_remaining_size * ratio(col);
            }
        }

        const size = sum(min_sizes);

        const this_size = (is_width ? this.width : this.height);
        let   this_size_px : number;
        if(this_size == undefined || this_size == "auto"){
            this_size_px = size;
        }
        else{
            if(this_size.endsWith("px")){
                this_size_px = pixel(this_size);
                if(this_size_px < size){
                    throw new MyError();
                }
            }
            else if(this_size.endsWith("%")){
                this_size_px = size / ratio(this_size);
            }
            else{
                throw new MyError();
            }
        }

        if(is_width){
            this.minWidths  = min_sizes;
            this.minSize!.x = this_size_px + this.marginBorderPaddingWidth();
        }
        else{
            this.minHeights = min_sizes;
            this.minSize!.y = this_size_px + this.marginBorderPaddingHeight();

        }
    }

    setMinSize() : void {
        this.minSize = Vec2.zero();

        this.children().forEach(x => x.setMinSize());
        this.setMinSizeSub(true);
        this.setMinSizeSub(false);
    }

    static calcSizes(descs : string[], min_sizes : number[], remaining_px : number) : number []{
        const sizes = Array<number>(descs.length);

        for(const [idx, desc] of descs.entries()){
            if(desc.endsWith("px")){
                sizes[idx] = pixel(desc);
                if(sizes[idx] < min_sizes[idx]){
                    throw new MyError();
                }
            }
            else if(desc.endsWith("%")){
                sizes[idx] = ratio(desc) * remaining_px;
            }
            else if(desc == "auto"){
                sizes[idx] = min_sizes[idx];
            }
            else{
                throw new MyError();
            }
        }

        return sizes;
    }

    layout(x : number, y : number, size : Vec2, nest : number){
        super.layout(x, y, size, nest);

        const fixed_width_px  = sum(range(this.numCols).filter(i => !this.colDescs[i].endsWith("%")).map(i => this.minWidths[i]));
        const fixed_height_px = sum(range(this.numRows).filter(i => !this.rowDescs[i].endsWith("%")).map(i => this.minHeights[i]));

        if(size.x < fixed_width_px || size.y < fixed_height_px){
            throw new MyError();
        }

        const remaining_width_px  = size.x - fixed_width_px;
        const remaining_height_px = size.y - fixed_height_px;

        this.colWidths  = GridNew.calcSizes(this.colDescs, this.minWidths , remaining_width_px);
        this.rowHeights = GridNew.calcSizes(this.rowDescs, this.minHeights, remaining_height_px);

        let y_offset = 0;
        for(const [row_idx, row] of this.cells.entries()){
            let offset = 0;
            let x_offset = 0;
            for(const ui of row){
                let ui_width_px  : number;
                let ui_height_px : number;

                if(ui.colspan == 1){
                    ui_width_px = this.colWidths[offset];
                }
                else{
                    ui_width_px = sum(this.colWidths.slice(offset, offset + ui.colspan));
                }

                if(ui.width != undefined && ui.width.endsWith("%")){
                    ui_width_px *= ratio(ui.width);
                }

                if(ui.rowspan == 1){
                    ui_height_px = this.rowHeights[row_idx];
                }
                else{
                    ui_height_px = sum(this.rowHeights.slice(row_idx, row_idx + ui.rowspan));
                }

                if(ui.height != undefined && ui.height.endsWith("%")){
                    ui_height_px *= ratio(ui.height);
                }

                const ui_size = new Vec2(ui_width_px, ui_height_px);
                ui.layout(x + x_offset, y + y_offset, ui_size, nest + 1);

                x_offset += sum(this.colWidths.slice(offset, offset + ui.colspan));

                offset += ui.colspan;
            }

            y_offset += this.rowHeights[row_idx];
        }

    }  


    updateRootLayout(){
        this.getAllUI().forEach(x => x.setMinSize());
        let size = Vec2.zero();

        let x : number;
        let y : number;

        if(this.colDescs.some(x => x.endsWith("%"))){

            size.x = window.innerWidth;
            x = 0;
        }
        else{

            size.x = this.minSize!.x;
            x = Math.max(0, 0.5 * (window.innerWidth  - size.x));
        }

        if(this.rowDescs.some(x => x.endsWith("%"))){

            size.y = window.innerHeight;
            y = 0;
        }
        else{

            size.y = this.minSize!.y;
            y = Math.max(0, 0.5 * (window.innerHeight - size.y));
        }

        this.layout(x, y, size, 0);
    }

    draw(){
        super.draw();
        this.children().forEach(x => x.draw());
    }

    str() : string {
        const col_descs = this.colDescs.join(" ");
        const row_descs = this.rowDescs.join(" ");

        const min_ws = this.minWidths.map(x => `${x}`).join(" ");
        const min_hs = this.minHeights.map(x => `${x}`).join(" ");

        const col_ws = this.colWidths.map(x => `${x}`).join(" ");
        const row_hs = this.rowHeights.map(x => `${x}`).join(" ");

        return `${super.str()} col:${col_descs} row:${row_descs} min-ws:${min_ws} min-hs:${min_hs} col-ws:${col_ws} row-hs:${row_hs}`;
    }

    dump(nest : number){
        super.dump(nest);
        for(const row of this.cells){
            row.forEach(ui => ui.dump(nest + 1));

            msg("");
        }
    }
}


/*
function $label(data : TextAttr) : Label {
    return new Label(data);
}

function $button(data : ButtonAttr) : Button {
    return new Button(data);
}

function $filler(data : Attr) : Filler {
    return new Filler(data);
}


function $grid(data : GridAttr) : Grid {    
    return new Grid(data);
}

function $hlist(data : Attr & { rows? : string, column?: string, children : UI[] }){
    const grid_data = data as any as GridAttr;

    grid_data.columns = data.column;
    grid_data.cells   = [ data.children ];

    delete (data as any).children;
    delete (data as any).column;

    return $grid(grid_data);
}

function $vlist(data : Attr & { rows? : string, column?: string, children : UI[] }){
    const grid_data = data as any as GridAttr;

    grid_data.columns = data.column;
    grid_data.cells   = data.children.map(x => [x]);

    delete (data as any).children;
    delete (data as any).column;

    return $grid(grid_data);
}
*/

}