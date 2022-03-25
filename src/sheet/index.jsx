import React, { useEffect, useState, useRef } from 'react';
import { Sheet } from "../data"
import { numToSSColumn } from "../utils"

import "./index.css"

const SheetComponent = () => {

    const [rowCol, setRowCol] = useState([20, 20])
    const [sheet, setsheet] = useState(Sheet);
    const [selectedCol, setSelectedCol] = useState("");
    const [selectedRow, setSelectedRow] = useState("");
    const menuRef = useRef()
    
    useEffect(() => {        
        const mat = {};
        let start =1
        while(start <= rowCol[0]) {
            mat[numToSSColumn(start)] = Array(rowCol[0]).fill({
                val: undefined,
                style: {} 
            }) 
            start++;
        }
        // console.log(mat);
        setsheet(mat)

        document.addEventListener("contextmenu", function(e) {      
            e.preventDefault(); 
            console.log(e.target.dataset)
              const {col, row } = e.target.dataset

            setSelectedCol(col);
            setSelectedRow(row);

            if(menuRef.current) {
                menuRef.current.style.position = 'absolute';
                menuRef.current.style.left = e.pageX + 'px';
                menuRef.current.style.top = e.pageY + 'px';        
                menuRef.current.style.display = "block";
            }
            
        });
          document.addEventListener("click", function(e){
            if(e.target.closest('.context_menu'))return;
                if(menuRef.current) {
                    menuRef.current.style.display = "none";
                }     
            
            });


    }, [])


    const addColumn = (col) => {
      setsheet(pre => {
        pre[numToSSColumn(rowCol[1]+1)] = Array(rowCol[0]).fill({
                val: undefined,
                style: {} 
            }) 
        return pre;
      })  
      setRowCol([rowCol[0], rowCol[1]+1])
    }

    const addRow = (rowIdx) => {
           console.log({rowIdx})
        let sh = sheet;
        let keys = Object.keys(sh)
        if(rowIdx) {
            keys.forEach(col => {
                sh[col].splice(rowIdx,0, {
                    val: undefined,
                    style: {} 
                })
            })
    
        }else {
          keys.forEach(col => {
                sh[col].push({
                    val: undefined,
                    style: {} 
                })
            })
        }
        
    
      setsheet(sh)  
      setRowCol([rowCol[0]+1, rowCol[1]])
    }

    const onChangeFn = (col, row) => (event) => {
         console.log(event.target.value, {col, row});
         let value = event.target.value || "";
         let sty = {};

          if(value.startsWith("=sum") || value.startsWith("=SUM")) {
            let exp = value.split("(").pop();
            exp = exp.replace(")", "");
            value = eval(exp);
         }

         if(!isNaN(value)) {
           value = Number(value);
           sty.textAlign = "right";  
         }



        const pre = {...sheet};
        console.log(pre[col][row] = {
            val: value,
            style: {...pre[col][row].style, ...sty} 
        } );
        // pre[col][+row].val += event.target.value;
        setsheet(pre)
    }


    const handleOnFocus = (event) => {
        
        if(event.target.classList.contains("cell")) {
            let tmpTxt = event.target.textContent
            event.target.textContent = ""
            let input = document.createElement("input");
            input.type = "text";
            const {col, row } = event.target.dataset
            console.log({col, row})
            input.onchange = onChangeFn(col, row)
            event.target.appendChild(input);
            input.style.border = "border: 2px solid blue";
            input.value = sheet[col][row].val || "";
            input.focus();
            input.addEventListener("blur", () => {
                event.target.removeChild(input)
                 event.target.classList.remove("focus");
                 event.target.textContent = tmpTxt;
            }, {once: true})
        }
    }

    

    const sortColumn = (flag) => (event) => {
        const pre = {...sheet};
         pre[selectedCol].sort((a,b) => {
           return !a.val ? 1: !b.val ? -1 :(flag ?  a.val - b.val : b.val - a.val)
         });
        console.log(pre);
        setsheet(pre);
    }

    const addTopBottomRow = (flag) => (event) => {
      console.log("selectedRow", selectedRow) 
      if(!selectedRow) return
      if(flag) {
        addRow(parseInt(selectedRow) +1)
      }else {
        addRow(selectedRow);
      }
    }


    return (
        <div className="ritz grid-container">
            <div className="context_menu" ref={menuRef}>
            <div onClick={sortColumn(true)}>Sort by A-Z</div>
            <div onClick={sortColumn(false)}>Sort by Z-A</div>
            <div onClick={addTopBottomRow(false)}>Add Row Top</div>
            <div onClick={addTopBottomRow(true)}>Add Row Bottom</div>
            </div>
          <table className="waffle" cellSpacing="0" cellPadding="0">
              <thead onClick={sortColumn}>
                  <tr>
                      <th className="row-header"></th>
                      {Object.keys(sheet).map((col, idx) => (
                        <th  key={col} data-col={col} data-colidx={idx} style={{width:"100px"}} className="column-headers-background">{col}</th>
                      ))}
                  </tr>
              </thead>
              <tbody onClick={handleOnFocus}>
                 {sheet.A.map((row, idx) => {
                    return (
                      <tr data-idx={idx} key={idx} style={{ height: "20px" }}>
                         <th style={{height: "20px"}} className="row-headers-background">
                          <div className="row-header-wrapper" style={{lineHeight: "20px"}}>{idx+1}</div>
                        </th>
                        {Object.keys(sheet).map((col) => (
                          <td key={col} className="cell" data-col={col} data-row={idx} style={sheet[col][idx].style}>
                            {(sheet[col][idx] && sheet[col][idx].val) || ""}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
              </tbody>
          </table>

          <button onClick={addColumn}>Add Col</button>
          <button onClick={addRow}>Add Row</button>
      </div>
    )
}

export default SheetComponent

