import { Component, ViewChild, ElementRef, OnInit, OnDestroy, HostListener, AfterViewInit, Input, input } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatSliderModule } from '@angular/material/slider';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'app-video-player',
    standalone: true,
    imports: [RouterOutlet, MatSliderModule, MatIconModule],
    templateUrl: './video-player.component.html',
    styleUrl: './video-player.component.scss'
})
export class VideoPlayerComponent implements OnInit, OnDestroy, AfterViewInit
{
    @ViewChild('videoPlayer') videoPlayer!: ElementRef;
    public isPlaying: boolean = false;

    @Input()
    public isFullScreen: boolean = false;

    @Input()
    public volume: number = 100;

    @Input()
    public fontColor: string = "#4C8BB6";

    @Input()
    public width: string = "750px";

    @Input()
    public backColor: string = "#ffffff";

    @Input()
    public bufferColor: string = "#adadad";

    @Input()
    public timelineColor: string = "#e8e8e8";

    public muted: boolean = false;
    public showControls: boolean = false;
    public progress: number = 0;
    public currentTime: string = this.getFormattedTime(0);
    public videoDuration: string = this.getFormattedTime(0);
    public showVideoInfo: boolean = false;

    private _isDragging: boolean = false;
    private _lastVolume: number = 10;
    private _progressInterval: any;

    private readonly BASE_WIDTH = this.width;

    public getPlayPauseButtonText = () => this.isPlaying ? 'pause' : 'play_arrow';
    public getFullscreenIcon = () => this.isFullScreen ? 'fullscreen_exit' : 'fullscreen';
    public getPlayPauseVideoInfoIcon = () => this.isPlaying ? 'play_arrow' : 'pause';
    public getVolumeInPercent = () => (Math.round(this.volume)).toString();
    public getVolumeButtonIcon = () => (this.muted == true) ? 'volume_off' : 'volume_down';

    constructor(private elementRef: ElementRef)
    { }

    @HostListener('document:keydown', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent)
    {
        switch (event.key)
        {
            case "ArrowRight":
                this.skipVideo(10);
                break;
            case "ArrowLeft":
                this.skipVideo(-10);
                break;
            case " ":
                this.togglePlayPause();
                break;
        }
    }

    private showVideoInfoDialog()
    {
        this.showVideoInfo = !this.showVideoInfo;

        setTimeout(() =>
        {
            this.showVideoInfo = !this.showVideoInfo;
        }, 1500);
    }

    private getFormattedTime(value: number): string
    {
        const hours: number = Math.floor(value / 3600);
        const minutes: number = Math.floor((value % 3600) / 60);
        const seconds: number = Math.floor(value % 60);

        const hoursStr: string = (hours < 10) ? '0' + hours : hours.toString();
        const minutesStr: string = (minutes < 10) ? '0' + minutes : minutes.toString();
        const secondsStr: string = (seconds < 10) ? '0' + seconds : seconds.toString();

        return hoursStr + ':' + minutesStr + ':' + secondsStr;
    }

    togglePlayPause(): void
    {
        if (this.videoPlayer.nativeElement.paused)
        {
            this.videoPlayer.nativeElement.play();
            this.isPlaying = true;
            this._progressInterval = setInterval(() =>
            {
                this.updateProgressBar();
            }, 1000);
        }
        else
        {
            this.videoPlayer.nativeElement.pause();
            this.isPlaying = false;
            clearInterval(this._progressInterval);
        }

        this.showVideoInfoDialog();
    }

    toggleFullScreen(): void
    {
        if (!this.isFullScreen)
        {
            this.width = '98vw';
            this.videoPlayer.nativeElement.style.height = 'auto';
        } else
        {
            this.width = this.BASE_WIDTH;
            this.videoPlayer.nativeElement.style.height = 'auto';
        }
        this.isFullScreen = !this.isFullScreen;
    }

    toggleMuteVideo()
    {
        if (this.muted)
        {
            this.muted = false;
            this.volume = this._lastVolume;
            this.setVolume(this.volume);
        } else
        {
            this.muted = true;
            this._lastVolume = this.volume;
            this.setVolume(0);
        }
    }

    setVolume(e?: number)
    {
        if (e != null)
            this.volume = e;

        this.videoPlayer.nativeElement.volume = (this.volume / 100);
    }

    onVolumeChanged(e: any)
    {
        this.volume = Number(e.target.value);
        this.setVolume(this.volume);
    }

    skipVideo(seconds: number)
    {
        const currentTime = this.videoPlayer.nativeElement.currentTime;
        let newTime = currentTime + seconds;
        newTime = Math.max(0, Math.min(this.videoPlayer.nativeElement.duration, newTime));
        this.videoPlayer.nativeElement.currentTime = newTime;

        this.updateProgressBar();
    }

    onMouseEnter()
    {
        this.showControls = true;
    }

    onMouseLeave()
    {
        this.showControls = false;
    }

    ngOnInit()
    {
        this.elementRef.nativeElement.addEventListener('dblclick', this.toggleFullScreen.bind(this));
        this.elementRef.nativeElement.addEventListener('mousemove', this.dragProgress.bind(this));
        this.elementRef.nativeElement.addEventListener('mouseup', this.stopDragging.bind(this));
    }

    ngOnDestroy()
    {
        this.elementRef.nativeElement.removeEventListener('dblclick', this.toggleFullScreen.bind(this));
        this.elementRef.nativeElement.removeEventListener('mousemove', this.dragProgress.bind(this));
        this.elementRef.nativeElement.removeEventListener('mouseup', this.stopDragging.bind(this));
        clearInterval(this._progressInterval);
    }

    ngAfterViewInit(): void
    {
        this.videoDuration = this.getFormattedTime(this.videoPlayer.nativeElement.duration);
    }

    updateProgressBar()
    {
        const video: HTMLVideoElement = this.videoPlayer.nativeElement;
        const progressPercent = (video.currentTime / video.duration) * 100;
        this.progress = progressPercent;
        this.currentTime = this.getFormattedTime(Math.round(video.currentTime));
    }

    seekVideo(event: MouseEvent)
    {
        if (!this._isDragging)
        {
            const progressBar: HTMLElement = event.currentTarget as HTMLElement;
            const rect = progressBar.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const percentage = (x / rect.width) * 100;
            const video: HTMLVideoElement = this.videoPlayer.nativeElement;
            video.currentTime = (percentage * video.duration) / 100;
        }
    }

    startDragging(event: MouseEvent)
    {
        this._isDragging = true;
        this.dragProgress(event);
    }

    dragProgress(event: MouseEvent)
    {
        if (this._isDragging)
        {
            const progressBar: HTMLElement = this.elementRef.nativeElement.querySelector('.progress-bar-container');
            const rect = progressBar.getBoundingClientRect();
            const x = event.clientX - rect.left;
            let percentage = (x / rect.width) * 100;
            percentage = Math.max(0, Math.min(100, percentage));
            this.progress = percentage;
            const video: HTMLVideoElement = this.videoPlayer.nativeElement;
            video.currentTime = (percentage * video.duration) / 100;
        }
    }

    stopDragging()
    {
        this._isDragging = false;
    }
}
