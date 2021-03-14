import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatNativeDateModule } from '@angular/material/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CodemirrorModule } from '@ctrl/ngx-codemirror';
import "../polyfills";
import { AboutPageComponent } from './about-page/about-page.component';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ConfirmDialogComponent } from './dialogs/confirm-dialog.component';
import { MessageDialogComponent } from './dialogs/message-dialog.component';
import { DocumentationComponent } from './documentation/documentation.component';
import { EditorComponent } from './editor/editor.component';
import { MainPageComponent } from './main-page/main-page.component';
import { MaterialModule } from './material.module';
import { MemoryComponent } from './memory/memory.component';
import { FormatPipe } from './pipes/format.pipe';
import { RegistersComponent } from './registers/registers.component';
import { MatSelectModule, MatIconModule } from '@angular/material';
import { LogicalNetworkDialogComponent } from './dialogs/logical-network-dialog.component';
import { MatMenuModule } from '@angular/material/menu';
import { MemoryAddressDialogComponent } from './dialogs/memory-address-dialog.component';
import { MatGridListModule } from '@angular/material/grid-list';
import { ImageDialogComponent } from './dialogs/image-dialog.component';

@NgModule({
   declarations: [
      AppComponent,
      EditorComponent,
      MainPageComponent,
      RegistersComponent,
      FormatPipe,
      MemoryComponent,
      DocumentationComponent,
      MessageDialogComponent,
      LogicalNetworkDialogComponent,
      MemoryAddressDialogComponent,
      ConfirmDialogComponent,
      ImageDialogComponent,
      AboutPageComponent
   ],
   imports: [
      BrowserModule,
      FormsModule,
      AppRoutingModule,
      CodemirrorModule,
      BrowserAnimationsModule,
      ReactiveFormsModule,
      MatNativeDateModule,
      HttpClientModule,
      MatMenuModule,
      MaterialModule,
      MatSelectModule,
      MatIconModule,
      MatGridListModule
   ],
   entryComponents: [
      MessageDialogComponent,
      ConfirmDialogComponent,
      MemoryAddressDialogComponent,
      ImageDialogComponent,
      LogicalNetworkDialogComponent,
   ],
   providers: [],
   bootstrap: [
      AppComponent
   ]
})
export class AppModule { }
