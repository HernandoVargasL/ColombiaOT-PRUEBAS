function projectGeometries(geometries, wkid){
    
    return new Promise((resolve, reject) => {
    console.log("Reproyectando geometrias...");
    const urlServiceGeometry = "https://pruebassig.igac.gov.co/server/rest/services/Utilities/Geometry/GeometryServer";
    require(["esri/rest/geometryService","esri/rest/support/ProjectParameters"], (geometryService, ProjectParameters) => { 
        const projectParameters = new ProjectParameters({
            geometries: geometries,
        outSpatialReference: {
wkid: wkid
}
      });
     
        geometryService.project(urlServiceGeometry, projectParameters)
      .then(function(projectedGeometries) {
        resolve(projectedGeometries);
      }).catch(function(error) {
        reject(error);
      });
      });
     

     });
}