
import regeneratorRuntime from 'regenerator-runtime'
import { createScopedThreejs } from 'threejs-miniprogram'
import { registerTextureLoader } from '../../loaders/texture_loader.js'
import { registerGLTFLoader } from '../../loaders/gltf-loader'

// 这里ModelRenderer

class ModelRenderer {
  constructor() { }

  async run(size, modelUrl, pageObj) {
    let that = this;
    wx.createSelectorQuery()
      .select('#webgl')
      .node()
      .exec(async function (res) {
        const canvas = res[0].node;
        // console.log(this)
        that.initRenderer(canvas, size, pageObj);
        await that.loadOBjAndRender(modelUrl);
      })
  }


  initRenderer(canvas, size = [0, 0, 100, 100], pageObj) {
    console.log('init');
    this.pageObj = pageObj;
    console.log(size)
    pageObj.setData({
      canvasWidth: size[2],
      canvasHeight: size[3],
      canvasTop: size[0],
      canvasLeft: size[1]

    });
    this.sysInfo = wx.getSystemInfoSync();

    let THREE = createScopedThreejs(canvas);
    THREE.canvas=canvas;//指定Canvas组件
    registerTextureLoader(THREE);//替换textureloader
    registerGLTFLoader(THREE); //添加gltf加载器


    let renderer, scene, camera;
    renderer = new THREE.WebGLRenderer({
      canvas:canvas,
      antialias: true,
      alpha:true
    });
    renderer.gammaInput=true;
    renderer.gammaOutput=true;
    renderer.setClearColor(0xffffff, 1);
    camera = new THREE.PerspectiveCamera(100, size[2] / size[3], 0.01, 1000);
    renderer.setPixelRatio( this.sysInfo.devicePixelRatio);

    scene=new THREE.Scene();

    scene.add(camera);
    camera.position.set(0.5,0,1.3);

    this.THREE=THREE;
    this.renderer=renderer;
    this.camera=camera;
    this.scene=scene;
    this.canvas=canvas;

  }

  async loadOBjAndRender(objUrl){

    let obj=await this.loadGltf(objUrl);
    // let a = await this.getMap('https://www.biubbmk.cn/90.png');

    this.scene.add(obj);
    // this.scene.add(new THREE.AmbientLight(0x666666));
    this.scene.traverse( function ( child ) {
      if ( child.isMesh ) {
        child.material.emissive =  child.material.color;
        child.material.emissiveMap = child.material.map ;
      }
    });
    obj.position.set(0,0,-0.5);
    console.log(obj.children[0].material.map)
    // obj.children[0].material.map = a
    this.obj=obj;

    this.inAnimate=false;
    this.animate();
    this.requestRender();
  }

  loadGltf(url) {
    // 读取场景模型
    console.log()
    return new Promise((resolve) => {
      let gltfLoader = new this.THREE.GLTFLoader();
      gltfLoader.load(url, obj => {
        console.log(obj,233)
        resolve(obj.scene);
      })
    });
  }

  getMap(url) {
    return new Promise((resolve) => {
      new this.THREE.TextureLoader().load( url, res => {
        resolve(res);
      });
    });
  }

  requestRender() {
    this.renderer.render(this.scene, this.camera);
    this.rotateObj(this.obj);
    this.canvas.requestAnimationFrame(this.requestRender.bind(this));
  }

  rotateObj(obj) {
    if(this.inAnimate){
      obj.rotation.set(obj.rotation.x, obj.rotation.y+this.speed, obj.rotation.z , 'XYZ');
      this.animateAccum+=this.speed
      if(this.animateAccum>=this.animateRange){
        this.inAnimate=false
      }
    }
  }
  
  animate(speed= Math.PI * 0.01,range=Math.PI*2){
    this.animateRange=range;
    this.animateAccum=0;
    this.speed=speed;
    this.inAnimate=true

  }

}
exports.ModelRenderer = ModelRenderer;