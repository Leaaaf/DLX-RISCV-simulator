import {Injector, Input, Inject, Injectable} from '@angular/core';
import {LogicalNetwork} from './logical-network';

@Injectable()
export class FFDLogicalNetwork extends LogicalNetwork {
  //ffd( name, d, a_res, a_set, clk)
  //mux( zero, one, sel)
  //tri( in, en )
  //bd0 = tri( ffd( start, mux( start.q, bd0, cs_write ), reset, null, memwr* ), cs_read )";


  constructor(cs_read: number, cs_write: number, injector: Injector) {
    super('FF-D', cs_read, cs_write);
    super.devType = "FF-D";
    this.ffd_a_res = false;
    this.ffd_a_set = true;
    this.cs = [];
    this.setCS("cs_read_ff",this.min_address,1);
    this.setCS("cs_set_ff",this.min_address + 0x00000001,1);
  }

  public load(address: number): number {
    let res = 0;
    let cs = this.cs.find(el => el.address == address);
    if(cs==null) res = super.load(address);
    else {
      switch(cs.id) {
        case "cs_read_ff":
          res = this.ffd_q ? 1 : 0;
      }
    }
    
    return res;
  }

  public store(address: number, word: number): void {
    let cs = this.cs.find(el => el.address == address);
    if(cs==null) return super.store(address,word);
    else {
      switch(cs.id) {
        case "cs_set_ff":
          this.ffd_q = (word & 0x1) == 0x1;
          break;
      }
    }
  }
}
