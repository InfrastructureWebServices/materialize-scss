import anim from "animejs";

import { Component, BaseOptions, InitElements, MElement } from "./component";

export interface RangeOptions extends BaseOptions {};

const _defaults: RangeOptions = {};

// TODO: !!!!!

export class Range extends Component<RangeOptions> {
  declare el: HTMLInputElement;
  private _mousedown: boolean;
  value: HTMLElement;
  thumb: HTMLElement;

  constructor(el: HTMLInputElement, options: Partial<RangeOptions>) {
    super(el, options, Range);
    (this.el as any).M_Range = this;

    this.options = {
      ...Range.defaults,
      ...options
    };

    this._mousedown = false;
    this._setupThumb();
    this._setupEventHandlers();
  }

  static get defaults(): RangeOptions {
    return _defaults;
  }

  /**
   * Initializes instance of Range.
   * @param el HTML element.
   * @param options Component options.
   */
  static init(el: HTMLInputElement, options?: Partial<RangeOptions>): Range;
  /**
   * Initializes instances of Range.
   * @param els HTML elements.
   * @param options Component options.
   */
  static init(els: InitElements<HTMLInputElement | MElement>, options?: Partial<RangeOptions>): Range[];
  /**
   * Initializes instances of Range.
   * @param els HTML elements.
   * @param options Component options.
   */
  static init(els: HTMLInputElement | InitElements<HTMLInputElement | MElement>, options: Partial<RangeOptions> = {}): Range | Range[] {
    return super.init(els, options, Range);
  }

  static getInstance(el: HTMLInputElement): Range {
    return (el as any).M_Range;
  }

  destroy() {
    this._removeEventHandlers();
    this._removeThumb();
    (this.el as any).M_Range = undefined;
  }

  _setupEventHandlers() {
    this.el.addEventListener('change', this._handleRangeChange);
    this.el.addEventListener('mousedown', this._handleRangeMousedownTouchstart);
    this.el.addEventListener('touchstart', this._handleRangeMousedownTouchstart);
    this.el.addEventListener('input', this._handleRangeInputMousemoveTouchmove);
    this.el.addEventListener('mousemove', this._handleRangeInputMousemoveTouchmove);
    this.el.addEventListener('touchmove', this._handleRangeInputMousemoveTouchmove);
    this.el.addEventListener('mouseup', this._handleRangeMouseupTouchend);
    this.el.addEventListener('touchend', this._handleRangeMouseupTouchend);
    this.el.addEventListener('blur', this._handleRangeBlurMouseoutTouchleave);
    this.el.addEventListener('mouseout', this._handleRangeBlurMouseoutTouchleave);
    this.el.addEventListener('touchleave', this._handleRangeBlurMouseoutTouchleave);
  }

  _removeEventHandlers() {
    this.el.removeEventListener('change', this._handleRangeChange);
    this.el.removeEventListener('mousedown', this._handleRangeMousedownTouchstart);
    this.el.removeEventListener('touchstart', this._handleRangeMousedownTouchstart);
    this.el.removeEventListener('input', this._handleRangeInputMousemoveTouchmove);
    this.el.removeEventListener('mousemove', this._handleRangeInputMousemoveTouchmove);
    this.el.removeEventListener('touchmove', this._handleRangeInputMousemoveTouchmove);
    this.el.removeEventListener('mouseup', this._handleRangeMouseupTouchend);
    this.el.removeEventListener('touchend', this._handleRangeMouseupTouchend);
    this.el.removeEventListener('blur', this._handleRangeBlurMouseoutTouchleave);
    this.el.removeEventListener('mouseout', this._handleRangeBlurMouseoutTouchleave);
    this.el.removeEventListener('touchleave', this._handleRangeBlurMouseoutTouchleave);
  }

  _handleRangeChange = () => {
    this.value.innerHTML = this.el.value;
    if (!this.thumb.classList.contains('active')) {
      this._showRangeBubble();
    }
    const offsetLeft = this._calcRangeOffset();
    this.thumb.classList.add('active');
    this.thumb.style.left = offsetLeft+'px';
  }

  _handleRangeMousedownTouchstart = (e: MouseEvent | TouchEvent) => {
    // Set indicator value
    this.value.innerHTML = this.el.value;
    this._mousedown = true;
    this.el.classList.add('active');
    if (!this.thumb.classList.contains('active')) {
      this._showRangeBubble();
    }
    if (e.type !== 'input') {
      const offsetLeft = this._calcRangeOffset();
      this.thumb.classList.add('active');
      this.thumb.style.left = offsetLeft+'px';
    }
  }

  _handleRangeInputMousemoveTouchmove = () => {
    if (this._mousedown) {
      if (!this.thumb.classList.contains('active')) {
        this._showRangeBubble();
      }
      const offsetLeft = this._calcRangeOffset();
      this.thumb.classList.add('active');
      this.thumb.style.left = offsetLeft+'px';
      this.value.innerHTML = this.el.value;
    }
  }

  _handleRangeMouseupTouchend = () => {
    this._mousedown = false;
    this.el.classList.remove('active');
  }

  _handleRangeBlurMouseoutTouchleave = () => {
    if (!this._mousedown) {
      const paddingLeft = parseInt(getComputedStyle(this.el).paddingLeft);
      const marginLeft = 7 + paddingLeft + 'px';
      if (this.thumb.classList.contains('active')) {
        anim.remove(this.thumb);
        anim({
          targets: this.thumb,
          height: 0,
          width: 0,
          top: 10,
          easing: 'easeOutQuad',
          marginLeft: marginLeft,
          duration: 100
        });
      }
      this.thumb.classList.remove('active');
    }
  }

  _setupThumb() {
    this.thumb = document.createElement('span');
    this.value = document.createElement('span');
    this.thumb.classList.add('thumb');
    this.value.classList.add('value');
    this.thumb.append(this.value);
    this.el.after(this.thumb);
  }

  _removeThumb() {
    this.thumb.remove();
  }

  _showRangeBubble() {
    const paddingLeft = parseInt(getComputedStyle(this.thumb.parentElement).paddingLeft);
    const marginLeft = -7 + paddingLeft + 'px'; // TODO: fix magic number?
    anim.remove(this.thumb);
    anim({
      targets: this.thumb,
      height: 30,
      width: 30,
      top: -30,
      marginLeft: marginLeft,
      duration: 300,
      easing: 'easeOutQuint'
    });
  }

  _calcRangeOffset(): number {
    const width = this.el.getBoundingClientRect().width - 15;
    const max = parseFloat(this.el.getAttribute('max')) || 100; // Range default max
    const min = parseFloat(this.el.getAttribute('min')) || 0; // Range default min
    const percent = (parseFloat(this.el.value) - min) / (max - min);
    return percent * width;
  }

  /**
   * Initializes every range input in the current document.
   */
  static Init(){
    Range.init((document.querySelectorAll('input[type=range]')) as NodeListOf<HTMLInputElement>, {});
  }
}
