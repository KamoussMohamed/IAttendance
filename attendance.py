import cv2
from model import SimpleFacerec
import os, json
from DbMananger import dumpStudents, postAbsentStudents
from datetime import datetime

#Global Variables
studentsList = dumpStudents()

# Initialize face recognition
sfr = SimpleFacerec()
sfr.load_encoding_images("images/")

# Initialize video capture
cap = cv2.VideoCapture(0)

if not cap.isOpened():
    print("Erreur : Impossible d'accéder à la caméra.")
    exit()

while True:
    ret, frame = cap.read()

    if not ret:
        print("Erreur : Impossible de lire le flux vidéo.")
        break

    face_locations, face_names = sfr.detect_known_faces(frame)

    for face_loc, name in zip(face_locations, face_names):
        top, right, bottom, left = face_loc
        cv2.rectangle(frame, (left, top), (right, bottom), (0, 255, 0), 2)
        cv2.putText(frame, name, (left, top - 10), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)

    cv2.imshow("Frame", frame)

    key = cv2.waitKey(1)
    if key == 27:  # ESC key
        try:
            with open("presence.json", "r") as file:
                presentStudents = json.load(file)

                present_students_set = {
                    (student['firstName'], 
                     student['midAndLastName'][0] if isinstance(student['midAndLastName'], list) else student['midAndLastName']) 
                    for student in presentStudents
                }
                

                absent_students = [
                    student for student in studentsList
                    if (student['firstName'], student['midAndLastName']) not in present_students_set
                ]
                absentStudentsList = []
                for student in absent_students:
                    absentStudent = {
                        "firstName": student['firstName'],
                        "midAndLastName": student['midAndLastName'],
                        "dateOfAbsence": datetime.now().strftime("%d-%m-%Y - %H:%M")
                    }
                    absentStudentsList.append(absentStudent)

                with open("absentStudents.json", "w") as file:  
                    json.dump(absentStudentsList, file, indent=4)
                postAbsentStudents()
        except FileNotFoundError:
            print("Json file not found")
        except json.JSONDecodeError:
            print("Error reading JSON file")
        except Exception as e:
            print(f"An error occurred: {str(e)}")
        
        if os.path.exists("presence.json"):
            os.remove("presence.json")
        if os.path.exists("absentStudents.json"):
            os.remove("absentStudents.json")
        break

cap.release()
cv2.destroyAllWindows()