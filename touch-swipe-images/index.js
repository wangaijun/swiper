/**
 * Created by xiaoma on 2017/7/31.
 * 使用工厂方法创建一个对象并返回，该对象只有一个可以调用的方法，init
 */
var fun = function (win, doc) {
    /**屏幕的高度 */
    var viewHeight = win.innerHeight || doc.body.clientHeight || doc.documentElement.clientHeight
    /**滑动部分最外部的容器 */
    var container = doc.querySelector('.container')
    /**滑动列表 */
    var imagesContainer = doc.querySelector('.images_container')
    /**滑动列表项 */
    var images = doc.querySelectorAll('.image_container')
    /**滑动列表项的总数 */
    var imagesLen = images.length
    /**总平移数量 */
    var totalTranslate = viewHeight * (imagesLen - 1)
    /**滑动阀值 */
    var DIS = 50 //滑动距离大于100时，切换到下一张图片
    var ANGEL = 30 //cos夹角小于30时，判断为上下滑动
    /**当前图片索引，从0开始 */
    var currIndex = 0
    /**平移的值 */
    var translate = 0
    /**是否正在触摸 */ 
    var isTouching = false
    /**是否已经移动 */ 
    var isMoved = false
    /**鼠标按下的值 */
    var startX, startY
    /**当前值和按下的值的区别 */
    var diffX, diffY

    /**入口方法，通过返回对象的init属性调用 */
    function init() {
        //使每一项的高度都是整个屏幕可视区域的高度
        Array.prototype.forEach.call(images, function (item) {
            item.style.height = viewHeight + 'px';
        });
        _bindEvent();
    }
    /**添加事件处理程序 */
    function _bindEvent() {
        /**鼠标按下 */
        container.addEventListener('touchstart', function (e) {
            if (isTouching) return;
            var target = e.targetTouches[0];
            startX = target.pageX;
            startY = target.pageY;
            isTouching = true;
            // console.log(imagesContainer.classList);
            imagesContainer.classList.remove('images_container');
            images[currIndex].classList.remove('image_container_transition');
            // console.log(imagesContainer.classList);
        }, false);
        /**鼠标移动 */
        container.addEventListener('touchmove', function (e) {
            if (!isTouching) return;
            var target = e.targetTouches[0],
                moveX = target.pageX,
                moveY = target.pageY;
            diffX = moveX - startX;
            diffY = moveY - startY;
            if (isMoved) { //开始移动标志已经被设置为真
                e.preventDefault();
                var viewHeightd3 = viewHeight / 3;
                /**向上翻 */
                if (translate === 0 && diffY > viewHeightd3) {
                    diffY = viewHeightd3;
                    return;
                }
                /**向下翻 */
                if (translate === -totalTranslate && diffY < -viewHeightd3) {
                    diffY = -viewHeightd3;
                    return;
                }
                // console.log(diffY);
                if (diffY !== 0) {
                    //平移距离
                    var translateY = translate + diffY
                    //占比
                    var ratio = Math.abs(diffY) / viewHeight
                    var scale = ratio < 0.12 ? (1 - ratio) : 0.88
                    var scaleY = (1 - scale) * viewHeight / 2
                    var sTranslateY = diffY < 0 ? (scaleY - diffY) : (-diffY - scaleY)
                    var translateY = diffY < 0 ? parseInt(translate + diffY - scaleY * 2) : parseInt(translate + diffY + scaleY * 2)
                    //images_container移动
                    imagesContainer.style.cssText = '-webkit-transform:translateY(' + translateY + 'px);transform:translateY(' + translateY + 'px);';
                    //当前的image_container移动并缩小
                    images[currIndex].style.cssText += 'z-index:0;-webkit-transform:translateY(' + sTranslateY + 'px) scale(' + scale + ');transform:translateY(' + sTranslateY + 'px) scale(' + scale + ');';
                }
            } else {
                //满足条件，设置开始移动标志为真
                var diffZ = Math.sqrt(Math.pow(diffX, 2) + Math.pow(diffY, 2));
                console.log(diffZ);
                var angel = Math.acos(Math.abs(diffY) / diffZ) / Math.PI * 180;
                if (diffZ > 5 && angel < ANGEL) {
                    e.preventDefault();
                    isMoved = true;
                }
            }
        }, false);
        /**鼠标抬起后，完成惯性运动 */
        container.addEventListener('touchend', function () {
            if (isTouching && isMoved) {
                var preIndex = currIndex;
                imagesContainer.classList.add('images_container');
                images[preIndex].classList.add('image_container_transition');
                if (translate === 0 && diffY > 0 || translate === -totalTranslate && diffY < 0) {
                    translate = translate;
                } else if (Math.abs(diffY) > DIS) {
                    translate = diffY > 0 ? (translate + viewHeight) : (translate - viewHeight);
                    currIndex = diffY > 0 ? (currIndex - 1) : (currIndex + 1);
                }
                //images_container移动
                imagesContainer.style.cssText = '-webkit-transform:translateY(' + translate + 'px);transform:translateY(' + translate + 'px);';
                //当前的image_container移动并缩小
                images[preIndex].style.cssText += 'z-index:1;-webkit-transform:translateY(' + 0 + 'px) scale(1);transform:translateY(-' + 0 + 'px) scale(1);';
            }
            isTouching = false;
            isMoved = false;
        }, false);
    }

    return {
        init: init
    }
};
var SwipeImage = fun(window, document);