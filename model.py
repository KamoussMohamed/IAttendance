import face_recognition
import cv2
import os
import numpy as np
import json
from datetime import datetime

class SimpleFacerec:
    def __init__(self):
        self.known_face_encodings = []
        self.known_face_names = []
        self.frame_resizing = 0.50
        self.detected_names = set()

    def load_encoding_images(self, images_path):
        images = os.listdir(images_path)

        print("Chargement des images pour encodage...")
        for img_path in images:
            try:
                img = cv2.imread(f"{images_path}/{img_path}")
                if img is None:
                    print(f"Erreur : Impossible de charger {img_path}")
                    continue

                rgb_img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
                img_encoding = face_recognition.face_encodings(rgb_img)[0]

                self.known_face_encodings.append(img_encoding)
                self.known_face_names.append(os.path.splitext(img_path)[0])
            except Exception as e:
                print(f"Erreur lors du traitement de {img_path}: {e}")
                continue

        print("Encodage terminé.")

    def detect_known_faces(self, frame):
        small_frame = cv2.resize(frame, (0, 0), fx=self.frame_resizing, fy=self.frame_resizing)
        rgb_small_frame = cv2.cvtColor(small_frame, cv2.COLOR_BGR2RGB)

        face_locations = face_recognition.face_locations(rgb_small_frame)
        face_encodings = face_recognition.face_encodings(rgb_small_frame, face_locations)

        if len(face_encodings) == 0:
            return [], []

        face_names = []
        for face_encoding in face_encodings:
            matches = face_recognition.compare_faces(self.known_face_encodings, face_encoding)
            name = "Unknown"

            face_distances = face_recognition.face_distance(self.known_face_encodings, face_encoding)
            best_match_index = np.argmin(face_distances)
            if matches[best_match_index]:
                name = self.known_face_names[best_match_index]
                
                if name not in self.detected_names and name != "Unknown":
                    self.detected_names.add(name)
                    
                    firstName = name.split()[0]
                    midAndLastName = name.split()[1:]
                    data = {
                        "firstName": firstName,
                        "midAndLastName": midAndLastName,
                        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                    }
                    
                    try:
                        if os.path.exists("presence.json"):
                            with open("presence.json", "r") as file:
                                try:
                                    presence_data = json.load(file)
                                except json.JSONDecodeError:
                                    presence_data = []
                        else:
                            presence_data = []
                        
                        presence_data.append(data)
                        
                        with open("presence.json", "w") as file:
                            json.dump(presence_data, file, indent=4)
                            
                    except Exception as e:
                        print(f"Error writing to presence.json: {e}")

            face_names.append(name)

        face_locations = (np.array(face_locations) / self.frame_resizing).astype(int).tolist()
        return face_locations, face_names