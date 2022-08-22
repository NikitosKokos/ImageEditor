document.addEventListener('DOMContentLoaded', () => {
   const imageEditorMain = document.querySelector('.image-editor');
   const editorCont = document.querySelector('.image-editor__container');
   const fileInput = document.querySelector('.image-editor__file');
   const prewiewImg = document.querySelector('.image-editor__preview img');
   const chooseImgBtn = document.querySelector('.image-editor__choose-img');
   const filterOptions = document.querySelectorAll('.panel-image-editor__filter .panel-image-editor__btn');
   const rotateOptions = document.querySelectorAll('.panel-image-editor__rotate .panel-image-editor__btn');
   const filterName = document.querySelector('.panel-image-editor__name');
   const filterSlider = document.querySelector('.panel-image-editor__input');
   const filterValue = document.querySelector('.panel-image-editor__value');
   const resetFilterBtn = document.querySelector('.image-editor__reset-filter');
   const inputValue = document.querySelector('.panel-image-editor__input-value');
   const saveImgBtn = document.querySelector('.image-editor__save-img');
   const dropArea = document.querySelector('.image-editor__drop-area');
   const changeThemeIcon = document.querySelector('.image-editor__change-theme');
   const inputChangeTheme = document.querySelector('.image-editor__change-theme input');

   let brightness = 100, saturation = 100, inversion = 0, grayscale = 0;
   let rotate = 0, flipHorizontal = 1, flipVertical = 1;

   const applyFilters = () => {
      prewiewImg.style.transform = `rotate(${rotate}deg) scale(${flipHorizontal}, ${flipVertical})`;
      prewiewImg.style.filter = `brightness(${brightness}%) saturate(${saturation}%) invert(${inversion}%) grayscale(${grayscale}%)`;
   }

   const loadImage = () => {
      let file = fileInput.files[0];
      if(!file) return;
      prewiewImg.src = URL.createObjectURL(file);
      prewiewImg.addEventListener('load', () => {
         resetFilter();
         editorCont.classList.remove('disabled');
      });
   }

   filterOptions.forEach(option => {
      option.addEventListener('click', () => {
         document.querySelector('.panel-image-editor__btn.active').classList.remove('active');
         option.classList.add('active');
         filterName.innerText = option.innerText;

         if(option.id === 'brightness'){
            filterSlider.max = '200';
            filterSlider.value = brightness;
            filterValue.innerText = `${brightness}%`;
         }else if(option.id === 'saturation'){
            filterSlider.max = '200';
            filterSlider.value = saturation;
            filterValue.innerText = `${saturation}%`;
         }else if(option.id === 'inversion'){
            filterSlider.max = '100';
            filterSlider.value = inversion;
            filterValue.innerText = `${inversion}%`;
         }else if(option.id === 'grayscale'){
            filterSlider.max = '100';
            filterSlider.value = grayscale;
            filterValue.innerText = `${grayscale}%`;
         }
         getCurrentSliderValue();
      });
   });

   const updateFilter = () => {
      filterValue.innerText = `${filterSlider.value}%`;
      const selectedFilter = document.querySelector('.panel-image-editor__btn.active');

      if(selectedFilter.id === 'brightness'){
         brightness = filterSlider.value;
      }else if(selectedFilter.id === 'saturation'){
         saturation = filterSlider.value;
      }else if(selectedFilter.id === 'inversion'){
         inversion = filterSlider.value;
      }else if(selectedFilter.id === 'grayscale'){
         grayscale = filterSlider.value;
      }
      applyFilters();
   }

   rotateOptions.forEach(option => {
      option.addEventListener('click', () => {
         if(option.id === 'left'){
            rotate -= 90;
         }else if(option.id === 'right'){
            rotate += 90;
         }else if(option.id === 'horizontal'){
            flipHorizontal = flipHorizontal === 1 ? -1 : 1;
         }else if(option.id === 'vertical'){
            flipVertical = flipVertical === 1 ? -1 : 1;
         }
         applyFilters();
      });
   });

   const resetFilter = () => {
      brightness = 100;
      saturation = 100;
      inversion = 0;
      grayscale = 0;
      rotate = 0;
      flipHorizontal = 1;
      flipVertical = 1;
      filterOptions[0].click();
      applyFilters();
   }

   const showInputValue = () => {
      inputValue.classList.add('show');
      filterValue.classList.add('hide');
      inputValue.value = filterValue.innerText.slice(0, -1);
      inputValue.focus();
   }

   const hideInputValue = () => {
      const value = Number(inputValue.value);
      inputValue.classList.remove('show');
      filterValue.classList.remove('hide');
      if(!isNaN(value) && inputValue.value !== ''){
         const selectedFilter = document.querySelector('.panel-image-editor__btn.active');
         
         if(selectedFilter.id === 'brightness' && 0 <= value && value <= 200){
            brightness = value;
         }else if(selectedFilter.id === 'saturation' && 0 <= value && value <= 200){
            saturation = value;
         }else if(selectedFilter.id === 'inversion' && 0 <= value && value <= 100){
            inversion = value;
         }else if(selectedFilter.id === 'grayscale' && 0 <= value && value <= 100){
            grayscale = value;
         }else{
            return;
         }
         filterSlider.value = value;
         filterValue.innerText = `${value}%`;
         applyFilters();
         getCurrentSliderValue();
      }
   }

   const keyUpInputHandle = e => {
      if(e.key === 'Enter'){
         hideInputValue();
      }
   }

   const saveImage = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = prewiewImg.naturalWidth;
      canvas.height = prewiewImg.naturalHeight;
      ctx.filter = `brightness(${brightness}%) saturate(${saturation}%) invert(${inversion}%) grayscale(${grayscale}%)`;
      ctx.translate(canvas.width / 2, canvas.height / 2);
      if(rotate !== 0){
         ctx.rotate(rotate * Math.PI / 180);
      }
      ctx.scale(flipHorizontal, flipVertical);
      ctx.drawImage(prewiewImg, -canvas.width / 2, -canvas.height / 2, canvas.width, canvas.height);
      
      const link = document.createElement('a');
      link.download = 'image.jpg';
      link.href = canvas.toDataURL();
      link.click();
   }

   const dragOver = e => {
      e.stopPropagation();
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
      dropArea.classList.add('over');
   }

   const dragLeave = () => {
      dropArea.classList.remove('over');
   }

   const dropHandle  = e => {
      e.stopPropagation();
      e.preventDefault();
      const fileList = e.dataTransfer.files;
      if(fileList[0] && fileList[0].type.slice(0, 5) === 'image'){
        readImage(fileList[0]);
      }else{
         dropArea.classList.remove('over');
      }
   }

   const readImage = (file) => {
      const reader = new FileReader();
      reader.addEventListener('load', e => {
         prewiewImg.src = e.target.result;
         dropArea.classList.remove('over');
         editorCont.classList.remove('disabled');
         resetFilter();
      });
      reader.readAsDataURL(file);
   }

   const changeTheme = () => {
      if(inputChangeTheme.checked){
         if(!localStorage.theme){
            localStorage.setItem('theme', 'orange');
         }else{
            localStorage.theme = 'orange';
         }
         changeThemeIcon.classList.add('orange');
         imageEditorMain.classList.add('orange');
      }else{
         if(!localStorage.theme){
            localStorage.setItem('theme', 'default');
         }else{
            localStorage.theme = 'default';
         }
         changeThemeIcon.classList.remove('orange');
         imageEditorMain.classList.remove('orange');
      }
   }

   if(localStorage.theme === 'orange'){
      inputChangeTheme.checked = true;
      changeThemeIcon.classList.add('orange');
      imageEditorMain.classList.add('orange');
   }

   const getCurrentSliderValue = () => {
      const value = (filterSlider.value - filterSlider.min) / filterSlider.max - filterSlider.min;
      filterSlider.style.setProperty('--value', value);
   }

   getCurrentSliderValue();

   filterSlider.addEventListener('input', getCurrentSliderValue);
   fileInput.addEventListener('change', loadImage);
   filterSlider.addEventListener('input', updateFilter);
   resetFilterBtn.addEventListener('click', resetFilter);
   filterValue.addEventListener('click', showInputValue);
   inputValue.addEventListener('focusout', hideInputValue);
   inputValue.addEventListener('keyup', keyUpInputHandle);
   saveImgBtn.addEventListener('click', saveImage);
   chooseImgBtn.addEventListener('click', () => fileInput.click());
   document.body.addEventListener('dragover', dragOver);
   document.body.addEventListener('dragleave', dragLeave);
   document.body.addEventListener('drop', dropHandle);
   inputChangeTheme.addEventListener('change', changeTheme);

}); // end