"""
Script pour accéder à la caméra DMS Dothinkey
"""
import cv2
import sys


def list_cameras(max_cameras=10):
    """Liste toutes les caméras disponibles"""
    available_cameras = []
    for i in range(max_cameras):
        cap = cv2.VideoCapture(i, cv2.CAP_DSHOW)
        if cap.isOpened():
            ret, _ = cap.read()
            if ret:
                available_cameras.append(i)
            cap.release()
    return available_cameras


def main():
    print("=== Caméra DMS Viewer ===\n")
    
    # Recherche des caméras disponibles
    print("Recherche des caméras disponibles...")
    cameras = list_cameras()
    
    if not cameras:
        print("Aucune caméra trouvée!")
        sys.exit(1)
    
    print(f"Caméras trouvées: {cameras}")
    
    # Utilise la première caméra trouvée (ou spécifie l'index)
    camera_index = cameras[0]
    print(f"\nOuverture de la caméra {camera_index}...")
    
    # Ouvre la caméra avec DirectShow (meilleure compatibilité Windows)
    cap = cv2.VideoCapture(camera_index, cv2.CAP_DSHOW)
    
    if not cap.isOpened():
        print(f"Erreur: Impossible d'ouvrir la caméra {camera_index}")
        sys.exit(1)
    
    # Configuration de la résolution (optionnel)
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)
    
    # Récupère les infos de la caméra
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    fps = cap.get(cv2.CAP_PROP_FPS)
    
    print(f"Résolution: {width}x{height}")
    print(f"FPS: {fps}")
    print("\nAppuie sur 'q' pour quitter, 's' pour sauvegarder une image")
    
    frame_count = 0
    
    while True:
        ret, frame = cap.read()
        
        if not ret:
            print("Erreur de lecture de la caméra")
            break
        
        # Affiche des informations sur l'image
        info_text = f"Camera {camera_index} | {width}x{height} | Frame: {frame_count}"
        cv2.putText(frame, info_text, (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 
                    0.7, (0, 255, 0), 2)
        
        # Affiche l'image
        cv2.imshow("DMS Camera Viewer", frame)
        
        frame_count += 1
        
        # Gestion des touches
        key = cv2.waitKey(1) & 0xFF
        
        if key == ord('q'):
            print("\nFermeture...")
            break
        elif key == ord('s'):
            filename = f"capture_{frame_count}.png"
            cv2.imwrite(filename, frame)
            print(f"Image sauvegardée: {filename}")
    
    cap.release()
    cv2.destroyAllWindows()
    print("Terminé!")


if __name__ == "__main__":
    main()
