import { Injectable } from '@angular/core';
import { Interpreter } from '../interpreters/interpreter';

@Injectable({
  providedIn: 'root'
})
export class CodeService {

  public content: string;
  public interpreter: Interpreter;
  public editorMode: string;

  constructor() {
  }

  load() {
    this.content = window.localStorage.getItem(`code-${this.editorMode}`) ||
      (this.editorMode == 'dlx' ?
        "init: LHI R30, 0x4000\t\t\t\t; set R30 = 0x40000000h\n" +
        "SW 0x0000(R30),R29\t\t\t\t\t; save R29 in 0x40000000h (RAM)\n" +
        "SW 0x0004(R30),R28\t\t\t\t\t; save R28 in 0x40000004h (RAM)\n" +
        "LHI R29, 0XC000\t\t\t\t\t\t; set R29 = 0xC0000000h (STARTUP address)\n" +
        "LBU R28, 0x0000(R29)\t\t\t\t; read STARTUP signal into R28\n" +
        "BEQZ R28, handler\t\t\t\t\t; if STARTUP == 0 then jump to (interrupt) handler\n" +
        "SB 0x0004(R29), R0\t\t\t\t\t; set STARTUP = 0\n" +
        "J main\t\t\t\t\t\t\t\t; jump to main:\n" +
        "handler:" +
        " LHI R29, 0x9000\t\t\t; set R29 = 0x90000000h\n" +
        "\t\tSB 0x0004(R29), R0\t\t\t; switch LED signal\n" +
        "\t\tLW R28, 0x0004(R30)\t\t\t; restore R28 value from memory (RAM)\n" +
        "\t\tLW R29, 0x0000(R30)\t\t\t; restore R29 value from memory (RAM)\n" +
        "\t\tRFE\n" +
        "\n\t\t\t\t\t\t\t\t\t; Fibonacci sequence\n" +
        "main:\tADDI R1,R0,0x0000\t\t\t; set R1 = 0\n" +
        "\t\tADDI R2,R0,0x0001\t\t\t; set R2 = 1\n" +
        "\t\tADDI R3,R0,0x0001\t\t\t; set R3 = 1\n" +
        "\t\tADDI R4,R0,0x0014\t\t\t; set counter R4 = 0x14\n" +
        "loop:\tADD R1,R2,R0\t\t\t\t; copy R2 into R1\n" +
        "\t\tADD R2,R3,R0\t\t\t\t; copy R3 into R2\n" +
        "\t\tADD R3,R2,R1\t\t\t\t; R3 = R2 + R1\n" +
        "\t\tSUBI R4,R4,0x0001\t\t\t; decrease R4 by 1\n" +
        "\t\tBEQZ R4,main\t\t\t\t; Jump to main if R4 == 0\n" +
        "\t\tJ loop\t\t\t\t\t\t; Jump to loop:"
        : 'main: ')
      ;
  }

  save() {
    window.localStorage.setItem(`code-${this.editorMode}`, this.content);
  }

  clear() {
    window.localStorage.removeItem(`code-${this.editorMode}`);
  }

  encode(lineN: number): number {
    return this.interpreter.encode(this.content.split('\n')[lineN]);
  }
}
