import { Pipe, PipeTransform } from "@angular/core";
  

@Pipe({ name: "pxPercent" })
export class pxPercentPipe implements PipeTransform {
 

  constructor() {
   
  }

  transform(value: string): string {  
    return (Number(value) * 100).toString().replace(/\%\s/g,'');
  }

  parse(value: string): string {   
    var v = value.replace('%','').replace(/\s/g,''); 
    return v.length==0 ? v : Number(value.replace('%','').replace(/\s/g,'')).toString();
  }

}