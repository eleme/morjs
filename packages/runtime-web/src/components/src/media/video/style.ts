import { css } from 'lit-element'

export const VideoStyles = css`
  :host {
    background-repeat: no-repeat;
    display: inline-block;
    overflow: hidden;
    font-size: 0;
    padding:0;
    margin:0;
    width: 100%
    height: 100%
  }

  .video-container {
    width: 100%;
    height: 100%;
  }

  .video-object-fit-contain{
    object-fit:contain;
    object-position:center center;
  }

  .video-object-fit-fill{
    object-fit:fill;
    object-position:center center;
  }

  .video-poster-background-size-contain{
    background-size: contain !important;
  }

  .video-poster-background-size-cover{
    background-size: cover !important;
  }
`
