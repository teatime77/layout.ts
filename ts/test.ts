namespace layout_ts {
//
export function makeTestUI(){
    const k = document.location.href.lastIndexOf("/");
    const home = document.location.href.substring(0, k);
    msg(`home:${home}`);

    const img_menu = $popup({
        children : [
            $button({
                width : "24px",
                height : "24px",
                url : `${home}/lib/plane/img/line-segment.png`
            })
            ,
            $button({
                width : "24px",
                height : "24px",
                url : `${home}/lib/plane/img/half-line.png`
            })
            ,
            $button({
                width : "24px",
                height : "24px",
                url : `${home}/lib/plane/img/line.png`
            })
        ]
    });

    const text_menu = $popup({
        direction : "column",
        children : [
            $button({
                text : "Cut"
            })
            ,
            $button({
                text : "Copy"
            })
            ,
            $button({
                text : "Paste"
            })
        ]
    });

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
                                text : "Play",
                                click : (ev:MouseEvent)=>{}
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
                        children : [
                            $button({
                                id : "add-statement",
                                width : "24px",
                                height : "24px",
                                url : `${home}/lib/plane/img/text.png`,
                                click : (ev : MouseEvent)=>{
                                    msg("show text menu");
                                    text_menu.show(ev);
                                }
                            })
                            ,
                            $button({
                                width : "24px",
                                height : "24px",
                                url : `${home}/lib/plane/img/statement.png`,
                                click : (ev : MouseEvent)=>{
                                    img_menu.show(ev);
                                }
                            })
                        ],
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

}