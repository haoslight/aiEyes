import { Component } from '@angular/core';
import { NativeStorage } from '@ionic-native/native-storage';
import { IonicPage, NavController, NavParams, LoadingController } from 'ionic-angular';
import { TranslateService } from '@ngx-translate/core';
import { CameraProvider } from './../../providers/camera/camera.provider';
import { NativeActionsProvider } from './../../providers/native-actions/native-actions.provider';
import { CognitiveService } from './../../providers/cognitive-services/cognitive-services.service';

@IonicPage()
@Component({
  selector: 'page-image-detail',
  templateUrl: 'image-detail.html',
})
export class ImageDetailPage {

  isMute: boolean = false;
  isVibrate: boolean = true;
  language: string = 'en-US';
  translateTo: string = 'en';
  translateTexts: Array<{title: string, text: string}>;
  picture: boolean|string = false;
  imageDescription: string = '';
  isSpeak: boolean = false;

  constructor(
    private nativeStorage: NativeStorage,
    private cameraProvider: CameraProvider,
    private nativeActionsProvider: NativeActionsProvider,
    private cognitiveService: CognitiveService,
    private translateService: TranslateService,
    public navCtrl: NavController,
    public navParams: NavParams,
    public loadingCtrl: LoadingController
  ) {

  }

  ionViewCanEnter() {
    this.nativeStorage.getItem('isMute').then(data => this.isMute = data);
    this.nativeStorage.getItem('isVibrate').then(data => this.isVibrate = data);
    this.nativeStorage.getItem('language').then(data => this.language = data);
    this.nativeStorage.getItem('translateTo').then(data => this.translateTo = data);

    this.translateTexts = [
      { title: 'LOADING', text: '' },
      { title: 'ANALYZING_IMAGE', text: '' }
    ];

    this.translateTexts.forEach(el => {
      this.translateService.get(el.title.toUpperCase()).subscribe((res: string) => {
        el.text = res;
      });
    });
  }

  ionViewDidLoad() {
    return this.takePicture();
  }

  async takePicture(): Promise<any> {
    const loading = this.loadingCtrl.create({
      content: `${this.translateTexts[0].text} ...`
    });

    let descriptionAnalyzedImage;

    loading.present();

    this.isSpeak = false;
    this.imageDescription = '';

    try {
      await this.cameraProvider.getPictureFromCamera().then(picture => {
        if (picture) {
          this.picture = picture;
        }

        if (!this.isMute) {
          this.nativeActionsProvider.playAudio(this.translateTexts[1].text, this.language);
        }
      }, error => {
        console.error(error);
      });

      await this.cognitiveService.analyzeImage(this.picture).then(description => {
        descriptionAnalyzedImage = description;
      }, error => {
        console.error(error);
      });

      await this.cognitiveService.translateText(descriptionAnalyzedImage, this.translateTo).subscribe(translated => {
        this.imageDescription = translated.text;

        if (this.isVibrate) {
          this.nativeActionsProvider.vibrate();
        }

        if (!this.isMute) {
          this.nativeActionsProvider.playAudio(translated.text, this.language);
        }

        this.isSpeak = true;
      });

      loading.dismiss();
    }
    catch (error) {
      console.error(error);
    }
  }

  async speakAgain(): Promise<any> {
    try {
      if (!this.isMute) {
        await this.nativeActionsProvider.playAudio(this.imageDescription, this.language);
      }
    }
    catch(error) {
      console.error(error);
    }
  }

}
