//****************** Libraries ******************//
import { Engine } from "@babylonjs/core/Engines/engine";
import { Scene } from "@babylonjs/core/scene";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { CreateSceneClass } from "../createScene";
import { SceneLoader } from "@babylonjs/core/Loading/sceneLoader";



//****************** required imports ******************//
import "@babylonjs/core/Loading/loadingScreen";
import "@babylonjs/loaders/glTF";
import "@babylonjs/core/Materials/standardMaterial";
import "@babylonjs/core/Materials/Textures/Loaders/envTextureLoader";



//****************** digital assets ******************//
import controllerScene from "../../assets/glb/scene.glb";
import {
    AbstractMesh,
    ActionManager,
    Color3,
    ExecuteCodeAction,
    MeshBuilder,
    Nullable,
    UniversalCamera
} from "@babylonjs/core";
import {StandardMaterial} from "@babylonjs/core/Materials/standardMaterial";



//****************** Functions ******************//

// Palette color function
const colorFunction = function (
    nameColor: StandardMaterial, 
    material: Nullable<AbstractMesh>, 
    red: number | undefined, 
    green: number | undefined, 
    blue: number | undefined
    ){
        nameColor.diffuseColor = new Color3(red, green, blue);
        material!.material = nameColor;
    };

// Palette color action function
const colorActionFunction = function (
    nameVarColor: AbstractMesh,
    scene: Scene,
    colorRed: number, 
    colorGreen: number, 
    colorBlue: number
){
    nameVarColor.actionManager!.registerAction(
        new ExecuteCodeAction({
            trigger: ActionManager.OnPickTrigger
        }, function (){
            localStorage.setItem("colorRed", String(colorRed));
            localStorage.setItem("colorGreen", String(colorGreen));
            localStorage.setItem("colorBlue", String(colorBlue));

            //Color paint brush
            const paintBrush = scene.getMeshByName("paint_color")!;
            const paintBrushMaterial = new StandardMaterial("paintBrushMaterial", scene);
            colorFunction(paintBrushMaterial, paintBrush, colorRed, colorGreen, colorBlue);
        })
    )
}



//****************** Main ******************//
export class LoadModelAndEnvScene implements CreateSceneClass {

    

    //****************** Create scene ******************//
    createScene = async (
        engine: Engine,
        canvas: HTMLCanvasElement
    ): Promise<Scene> => {
        const scene = new Scene(engine);
        
        // add realistic attribute
        scene.gravity = new Vector3(0, -.75,0);
        scene.gravity.set(0,-9.8,0);
        scene.collisionsEnabled = true;
        scene.enablePhysics();
        
        
        
        //****************** Result scene ******************//
        const resultScene = await SceneLoader.ImportMeshAsync(
            "",
            "",
            controllerScene,
            scene,
            undefined,
            ".glb"
        );

        // position scene
        resultScene.meshes[0].position = new Vector3(1,-10,1);

        
        
        //****************** Set up camera ******************//
        const camera = new UniversalCamera("UniversalCamera", new Vector3(0,3,5), scene);
        camera.setTarget(Vector3.Zero());
        camera.applyGravity = true;
        camera.ellipsoid = new Vector3(1,8,1);
        camera.checkCollisions = true;
        
        // This attaches the camera to the canvas
        camera.attachControl(canvas, true);
        
        

        //****************** Create light ******************//
        const light = new HemisphericLight(
            "light",
            new Vector3(0, 1, 0),
            scene
        );

        // Add intensity
        light.intensity = 0.7;

        
        
        //****************** Controls ZQSD ******************//
        camera.keysUp.push(90);
        camera.keysDown.push(83);
        camera.keysRight.push(68);
        camera.keysLeft.push(81);

        
        
        //****************** Camera movement ******************//
        const isLocked = false;
        scene.onPointerDown = function (evt) {
            if(!isLocked){
                canvas.requestPointerLock = canvas.requestPointerLock || canvas.msRequestPointerLock || 
                    canvas.mozRequestPointerLock ||canvas.webkitRequestPointerLock;
                if (canvas.requestPointerLock) {
                    canvas.requestPointerLock();
                }
            }
        };

        
        
        //****************** Add physical ground ******************//
        const myGround = MeshBuilder.CreateGround(
            "myGround", 
            {width: 200, height : 200, subdivisions: 4}, 
            scene
        );
        
        myGround.checkCollisions = true;
        myGround.position = new Vector3(1,-10,1);
        


        //****************** Paint object ******************//
        // Create & placement cube
        const box = MeshBuilder.CreateBox("box", {width: 1, height: 1, depth: 1}, scene);
        box.position.z = -2;
        
        // Create action manager
        box.actionManager = new ActionManager(scene);
        const boxMaterial = new StandardMaterial("boxMaterial", scene);
        
        // paint cube
        box.actionManager.registerAction(
            new ExecuteCodeAction({
                trigger: ActionManager.OnPickTrigger
            }, function (){
                colorFunction(
                    boxMaterial, 
                    box, 
                    Number(localStorage.getItem("colorRed")), 
                    Number(localStorage.getItem("colorGreen")), 
                    Number(localStorage.getItem("colorBlue"))
                );
            })
        )
        
        // painting board
        const board = scene.getMeshByName("board")!;
        const boardMaterial = new StandardMaterial("boardMaterial", scene);

        board.actionManager = new  ActionManager(scene);

        board!.actionManager!.registerAction(
            new ExecuteCodeAction({
                trigger: ActionManager.OnPickTrigger
            }, function (){
                colorFunction(
                    boardMaterial,
                    board,
                    Number(localStorage.getItem("colorRed")),
                    Number(localStorage.getItem("colorGreen")),
                    Number(localStorage.getItem("colorBlue"))
                );
            })
        )
        

        
        //****************** Change palette colors ******************//
        //Blue
        const blueColor = scene.getMeshByName("Color0")!;
        const blueColorMaterial = new StandardMaterial("blueColorMaterial", scene);
        colorFunction(blueColorMaterial, blueColor, 0.11, 0.21, 0.34);

        //Green
        const greenColor = scene.getMeshByName("Color1")!;
        const greenColorMaterial = new StandardMaterial("greenColorMaterial", scene);
        colorFunction(greenColorMaterial, greenColor, 0.17, 0.58, 0.28);

        //Red
        const redColor = scene.getMeshByName("Color2")!;
        const redColorMaterial = new StandardMaterial("redColorMaterial", scene);
        colorFunction(redColorMaterial, scene.getMeshByName("Color2"), 0.9, 0.22, 0.27);

        //Purple
        const purpleColor = scene.getMeshByName("Color3")!;
        const purpleColorMaterial = new StandardMaterial("purpleColorMaterial", scene);
        colorFunction(purpleColorMaterial, purpleColor, 0.71, 0.09, 0.62);

        //Yellow
        const yellowColor = scene.getMeshByName("Color4")!;
        const yellowColorMaterial = new StandardMaterial("yellowColorMaterial", scene);
        colorFunction(yellowColorMaterial, scene.getMeshByName("Color4"), 1, 0.72, 0.01);

        //Orange
        const orangeColor = scene.getMeshByName("Color5")!;
        const orangeColorMaterial = new StandardMaterial("orangeColorMaterial", scene);
        colorFunction(orangeColorMaterial, orangeColor, 0.98, 0.52, 0);

        //Black
        const blackColor = scene.getMeshByName("Color6")!;
        const blackColorMaterial = new StandardMaterial("blackColorMaterial", scene);
        colorFunction(blackColorMaterial, blackColor, 0, 0, 0);

        //White
        const whiteColor = scene.getMeshByName("Color7")!;
        const whiteColorMaterial = new StandardMaterial("whiteColorMaterial", scene);
        colorFunction(whiteColorMaterial, whiteColor, 1, 1, 1);



        //****************** Palette Color Action ******************//
        //Blue
        blueColor.actionManager = new ActionManager(scene);
        colorActionFunction(blueColor, scene, 0.11, 0.21, 0.34);
        
        //Green
        greenColor.actionManager = new ActionManager(scene);
        colorActionFunction(greenColor, scene, 0.17, 0.58, 0.28);
        
        //Red
        redColor.actionManager = new ActionManager(scene);
        colorActionFunction(redColor, scene, 0.9, 0.22, 0.27);
        
        //Purple
        purpleColor.actionManager = new ActionManager(scene);
        colorActionFunction(purpleColor, scene,0.71, 0.09, 0.62);
        
        //Yellow
        yellowColor.actionManager = new ActionManager(scene);
        colorActionFunction(yellowColor, scene, 1, 0.72, 0.01);
        
        //Orange
        orangeColor.actionManager = new ActionManager(scene);
        colorActionFunction(orangeColor, scene, 0.98, 0.52, 0);
        
        //Black
        blackColor.actionManager = new ActionManager(scene);
        colorActionFunction(blackColor, scene, 0, 0, 0);
        
        //White
        whiteColor.actionManager = new ActionManager(scene);
        colorActionFunction(whiteColor, scene, 1, 1, 1);
        
        
        
        //****************** Collisions ******************//
        for (let meshe of scene.meshes)
        {
            meshe.checkCollisions = true;
        }
        
        // Disable house ground collision (we have already collision for ground)
        scene.getMeshByName('base_primitive1')!.checkCollisions = false;
        
        
       
        return scene;
    };
}

export default new LoadModelAndEnvScene();
