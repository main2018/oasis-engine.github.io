/**
 * @title Animation Additive
 * @category Animation
 */
import { OrbitControl } from "@oasis-engine/controls";
import {
  AnimationClip,
  Animator,
  AnimatorController,
  AnimatorControllerLayer,
  AnimatorLayerBlendingMode,
  AnimatorStateMachine,
  Camera,
  DirectLight,
  GLTFResource,
  Logger,
  SystemInfo,
  Vector3,
  WebGLEngine
} from "oasis-engine";

Logger.enable();

const engine = new WebGLEngine("canvas");
engine.canvas.width = window.innerWidth * SystemInfo.devicePixelRatio;
engine.canvas.height = window.innerHeight * SystemInfo.devicePixelRatio;
const scene = engine.sceneManager.activeScene;
const rootEntity = scene.createRootEntity();

// camera
const cameraEntity = rootEntity.createChild("camera_node");
cameraEntity.transform.position = new Vector3(0, 1, 5);
cameraEntity.addComponent(Camera);
cameraEntity.addComponent(OrbitControl).target = new Vector3(0, 1, 0);

const lightNode = rootEntity.createChild("light_node");
lightNode.addComponent(DirectLight).intensity = 0.6;
lightNode.transform.lookAt(new Vector3(0, 0, 1));
lightNode.transform.rotate(new Vector3(0, 90, 0));

engine.resourceManager
  .load<GLTFResource>("https://gw.alipayobjects.com/os/bmw-prod/5e3c1e4e-496e-45f8-8e05-f89f2bd5e4a4.glb")
  .then((asset) => {
    const { animations, defaultSceneRoot } = asset;
    const animator = defaultSceneRoot.getComponent(Animator)
    const animatorController = new AnimatorController();
    const layer = new AnimatorControllerLayer("layer");
    const layer1 = new AnimatorControllerLayer("layer1");
    const animatorStateMachine = new AnimatorStateMachine();
    const animatorStateMachine1 = new AnimatorStateMachine();
    animatorController.addLayer(layer);
    animatorController.addLayer(layer1);
    animator.animatorController = animatorController;
    layer.stateMachine = animatorStateMachine;
    layer1.stateMachine = animatorStateMachine1;
    layer1.blendingMode = AnimatorLayerBlendingMode.Additive;
    if (animations) {
      animations.forEach((clip: AnimationClip) => {
        if (clip.name === "agree") {
          const animatorState = animatorStateMachine.addState(clip.name);
          animatorState.clip = clip;
        }
        if (clip.name === "sneak_pose") {
          const animatorState2 = animatorStateMachine1.addState(clip.name);
          animatorState2.clip = clip;
          animatorState2.clipStartTime = 1;
        }
      });
    }
    rootEntity.addChild(defaultSceneRoot);
    animator.play("agree", 0);
    animator.play("sneak_pose", 1);
  });

engine.run();
