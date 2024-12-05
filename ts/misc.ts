namespace layout_ts {
//

export class ImgDiv extends UI {
    div : HTMLDivElement;
    img : HTMLImageElement;
    uploadImgFile : (file : File)=>Promise<string>;
    imgUrl : string = "";

    constructor(data : Attr & { uploadImgFile : (file : File)=>Promise<string> }){
        super(data);
        this.uploadImgFile = data.uploadImgFile;

        this.div = document.createElement("div");
        this.div.style.display        = "flex";
        this.div.style.justifyContent = "center";
        this.div.style.alignItems     = "center";

        this.img = document.createElement("img");
        this.img.style.maxWidth  = "100%";
        this.img.style.maxHeight = "100%";

        this.div.append(this.img);

        this.div.addEventListener("dragenter", (ev : DragEvent)=>{
            preventDefaults(ev);
            msg("drag enter");
        });
    
        this.div.addEventListener("dragover", (ev : DragEvent)=>{
            preventDefaults(ev);
            this.div.classList.add('dragover')
    
            msg("drag over");
        });
    
        this.div.addEventListener("dragleave", (ev : DragEvent)=>{
            preventDefaults(ev);
            this.div.classList.remove('dragover');
            msg("drag leave");
        });
    
        this.div.addEventListener("drop", async (ev : DragEvent)=>{
            preventDefaults(ev);
            this.div.classList.remove('dragover');
    
            msg("drop");
            const dt = ev.dataTransfer;
            if(dt == null){
                return;
            }
    
            const files = Array.from(dt.files);
    
            msg(`${files}`);
    
            if(files.length == 1){
                const file = files[0];

                if(file.type == "image/png" || file.type == "image/jpeg"){

                    const reader = new FileReader();
                    reader.addEventListener("load", (ev : ProgressEvent<FileReader>)=>{
                        if(ev.target != null){

                            if(typeof ev.target.result == "string"){

                                this.img.src = ev.target.result;
                            }
                            else{

                                throw new MyError(`load img error: ${file.name} result:${typeof ev.target.result}`);
                            }
                        }
                        else{

                            throw new MyError(`load img error: ${file.name}`);
                        }
                    });

                    reader.readAsDataURL(file);
    
                    this.imgUrl = await this.uploadImgFile(file);
                }
                else{    
                    msg(`File name: ${file.name}, File size: ${file.size}, File type: ${file.type}`);
                }
            }
        });
    }

    html(): HTMLElement {
        return this.div;
    }
}

function preventDefaults(ev:DragEvent) {
    ev.preventDefault(); 
    ev.stopPropagation();
}


export async function showImageDlg(ev:MouseEvent, upload_img_file : (file : File)=>Promise<string>){
    const content = $flex({
        width  : "400px",
        height : "300px",
        backgroundColor : "cornsilk",
        children: [

        ]
    });


    const dlg = layout_ts.$dialog({
        content : content
    });

    dlg.showModal(ev);
}

}