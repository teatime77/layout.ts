namespace layout_ts {
//
export function makeTestUI(){
    const [ origin, , ] = i18n_ts.parseURL();

    const img_menu = $popup({
        children : [
            $button({
                width : "24px",
                height : "24px",
                url : `${origin}/lib/plane/img/line-segment.png`
            })
            ,
            $button({
                width : "24px",
                height : "24px",
                url : `${origin}/lib/plane/img/half-line.png`
            })
            ,
            $button({
                width : "24px",
                height : "24px",
                url : `${origin}/lib/plane/img/line.png`
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
                    })
                    ,
                    $block({
                        children : [
                            $button({
                                text : "Play",
                                click : async (ev:MouseEvent)=>{}
                            })
                        ],
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
                                url : `${origin}/lib/plane/img/selection.png`
                            })
                            ,
                            $radio({
                                value : "",
                                title : "",
                                width : "24px",
                                height : "24px",
                                url : `${origin}/lib/plane/img/point.png`
                            })
                        ],
                    })
                    ,
                    $block({
                        children : [
                            $button({
                                id : "add-statement",
                                width : "24px",
                                height : "24px",
                                url : `${origin}/lib/plane/img/text.png`,
                                click : async (ev : MouseEvent)=>{
                                    msg("show text menu");
                                    text_menu.show(ev);
                                }
                            })
                            ,
                            $button({
                                width : "24px",
                                height : "24px",
                                url : `${origin}/lib/plane/img/statement.png`,
                                click : async (ev : MouseEvent)=>{
                                    img_menu.show(ev);
                                }
                            })
                        ],
                    })
                    ,
                    $block({
                        children : [],
                    })
                    ,
                    $block({
                        children : [],
                    }),
                ]
            })
        ]
    });

    return root;
}

}