import React from 'react';
import { faker } from '@faker-js/faker'; // Make sure this is the correct import
import { db } from '../config/firebase_config';
import { collection, addDoc } from 'firebase/firestore';

const getStatusFromPoints = (points) => {
  if (points >= 0 && points <= 499) return "Lad";
  if (points >= 500 && points <= 1499) return "Rising Star";
  if (points >= 1500 && points <= 2499) return "Pace Setter";
  if (points >= 2500 && points <= 3499) return "Influencer";
  if (points >= 3500 && points <= 4499) return "Social Maven";
  if (points >= 4500 && points <= 5499) return "Iconic Figure";
  if (points >= 5500 && points <= 6499) return "Trailblazer";
  if (points >= 6500 && points <= 7499) return "Legend";
  if (points >= 7500 && points <= 8499) return "Campus Legend";
  if (points >= 8500 && points <= 10000) return "Campus Icon";
  return "Lad";
};

const generateFakeUser = () => {
  const points = faker.number.int({ min: 0, max: 10000 });
  const status = getStatusFromPoints(points);

  return {
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    username: faker.internet.userName(),
    email: faker.internet.email(),
    profilePicture: faker.image.avatar(),
    bio: faker.lorem.sentence(),
    location: faker.location.city(),
    campus: faker.company.name(),
    points: points,
    status: status,
    dateJoined: faker.date.past(),
    socialMediaLinks: {
      twitter: faker.internet.url(),
      facebook: faker.internet.url(),
      instagram: faker.internet.url(),
    },
    competitionsEntered: faker.number.int({ min: 0, max: 20 }),
    competitionWins: faker.number.int({ min: 0, max: 5 }),
    friends: faker.number.int({ min: 0, max: 50 }),
    currentParticipatingCompetitions: [
      faker.lorem.words(),
      faker.lorem.words(),
    ],
  };
};

const AddFakeUsers = () => {
  const addFakeUsersToFirestore = async (numUsers) => {
    const userCollectionRef = collection(db, 'users');
    for (let i = 0; i < numUsers; i++) {
      const fakeUser = generateFakeUser();
      try {
        await addDoc(userCollectionRef, fakeUser);
        console.log(`Added user: ${fakeUser.username}`);
      } catch (error) {
        console.error("Error adding user: ", error);
      }
    }
    console.log(`Successfully added ${numUsers} fake users to Firestore.`);
  };

  return (
    <div>
      <h1>Add Fake Users to Firestore</h1>
      <button onClick={() => addFakeUsersToFirestore(10)}>
        Add 10 Fake Users
      </button>
    </div>
  );
};

export default AddFakeUsers;
