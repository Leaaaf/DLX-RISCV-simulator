import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'format'
})
export class FormatPipe implements PipeTransform {

  transform(n: number, type: 'dec' | 'bin' | 'hex' | 'oct', length: number = 32): any {
    switch (type) {
      case 'dec':
        return (n > 268435455 || n<0) ? n >>> 4 : n;
      case 'bin':
        return (n >>> 0).toString(2).padStart(length, '0');
      case 'hex':
        return '0x' + (n >>> 0).toString(16).padStart(Math.ceil(length / 4), '0').toUpperCase();
      case 'oct':
        return (n >>> 0).toString(8).padStart(Math.ceil(length / 2), '0').toUpperCase();
    }
  }

}
