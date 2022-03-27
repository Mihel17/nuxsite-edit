const aboutSlider = document.querySelector('.about-promo__slider')
const sliderContentList = aboutSlider.querySelectorAll('.about-promo__slide-content')
const makeSameHeight = (elList) => {
  let sliderContentHeight = 0;
  for (const item of elList) {
    console.log(item, item.offsetHeight)
    if (item.offsetHeight > sliderContentHeight) {
      sliderContentHeight = item.offsetHeight;
    }
  }
  // for (const item of sliderContentList) {
  //   item.style.height = `${sliderContentHeight}px`;
  // }
}
makeSameHeight(sliderContentList)
