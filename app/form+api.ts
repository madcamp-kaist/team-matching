import { ExpoRequest, ExpoResponse } from 'expo-router/server';
import * as XLSX from 'xlsx';

export function GET(request: ExpoRequest) {
    const excelFileName = `participants_form.xlsx`;

    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet([{
        "name" : '박수빈',
        "school" : 'KAIST',
        "gender" : "남"
    }]); 
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

    if(!ws.B1.c) ws.B1.c = [];
    ws.B1.c.hidden = true;
    ws.B1.c.push({a:"psb0623", t:"KAIST는 정확히 KAIST로 입력"});
    if(!ws.C1.c) ws.C1.c = [];
    ws.C1.c.hidden = true;
    ws.C1.c.push({a:"psb0623", t:"남/여 중 하나로 입력"});


    let wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" })
    //const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), fileContent], { type: "text/csv;charset=utf-8" });
    var blob = new Blob([new Uint8Array(wbout)], {type:"application/octet-stream"});
    const response = new ExpoResponse(blob);
    response.headers.set("Content-Disposition", `attachment; filename="${excelFileName}"`);
    return response;
}