from pymongo import MongoClient
import json, datetime, os


#Global Variables
collections = ["studentCollection", "studentAbsentFromSession"]
studentsPicturesPath = 'images'
studentsList = []
db = MongoClient('mongodb://localhost:27017')['presenceAI']



#func to get students names 
def getStudentsNamesFromImages():
    fullNames = []
    fileNamesWithoutExtension = []
    for file in os.listdir(studentsPicturesPath):
        #Images Has to be in .png
        fileNamesWithoutExtension.append(file.replace('.png',''))
    for i in fileNamesWithoutExtension:
        fullNames.append(i.split(' '))
    return fullNames

#func to create the students DB
def createStudentsDb():
    fullNames = getStudentsNamesFromImages()
    for name in fullNames:
        student = {
            "firstName": name[0],
            "midAndLastName": " ".join(name[1:])
        }
        studentsList.append(student)
    collection = db[collections[0]]
    for student in studentsList:
        collection.insert_one(student)

#func to query for students
def getStudentByFullName(firstName:str, midAndLastName:str):
    collection = db[collections[0]]
    student = collection.find_one({"firstName": firstName, "midAndLastName":midAndLastName})
    return student

#func to get all students names
def dumpStudents():
    collection = db[collections[0]]
    studentsList = list(collection.find({},{'_id':0}))
    return studentsList

def postAbsentStudents():
    collection = db[collections[1]]
    with open("absentStudents.json", "r") as file:
        data = json.load(file)
        for i in data :
            collection.insert_one(i)