import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { NativeActionsProvider } from './../../providers/native-actions/native-actions';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  constructor(
    private nativeActionsProvider: NativeActionsProvider,
    public navCtrl: NavController
  ) {

  }

  takePicture() {
    this.navCtrl.push('ImageDetailPage');
  }

  ionViewDidLoad() {
    this.nativeActionsProvider.playAudio('Toque na tela e tire uma foto');
  }

}
