import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../../../config/firebase_config'; // Adjust the path based on your project structure
import { doc, updateDoc } from 'firebase/firestore';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const BankAccountForm = () => {
  const [banks, setBanks] = useState([]);
  const [selectedBank, setSelectedBank] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [resolutionStatus, setResolutionStatus] = useState('');
  const [transferRecipient, setTransferRecipient] = useState(null);
  const [userId, setUserId] = useState(null);

  const navigate = useNavigate(); // Use navigate to redirect
  const SECRET_KEY = import.meta.env.VITE_PAYSTACK_SECRET_KEY; // Paystack secret key

  // Fetch available banks
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      if (user) {
        setUserId(user.uid);
      } else {
        console.log('User not logged in');
      }
    });

    axios.get('https://api.paystack.co/bank?currency=NGN', {
      headers: { Authorization: `Bearer ${SECRET_KEY}` },
    })
      .then(response => setBanks(response.data.data))
      .catch(error => toast.error('Error fetching banks: ' + error.message));

    return () => unsubscribe();
  }, []);

  // Handle account resolution
  const resolveAccount = () => {
    if (!selectedBank || !accountNumber) {
      toast.error('Please select a bank and enter an account number.');
      return;
    }

    axios.get('https://api.paystack.co/bank/resolve', {
      headers: { Authorization: `Bearer ${SECRET_KEY}` },
      params: { account_number: accountNumber, bank_code: selectedBank },
    })
      .then(response => {
        if (response.data.status) {
          setAccountName(response.data.data.account_name);
          setResolutionStatus('Account resolved successfully!');
          toast.success('Account resolved successfully!');
        } else {
          setResolutionStatus('Failed to resolve account.');
          toast.error('Failed to resolve account.');
        }
      })
      .catch(error => {
        setResolutionStatus('Error resolving account.');
        toast.error('Error resolving account: ' + error.message);
      });
  };

  // Handle transfer recipient creation
  const createTransferRecipient = () => {
    if (!accountName || !accountNumber || !selectedBank) {
      toast.error('Please resolve the account before proceeding.');
      return;
    }

    axios.post('https://api.paystack.co/transferrecipient', {
      type: 'nuban',
      name: accountName,
      account_number: accountNumber,
      bank_code: selectedBank,
      currency: 'NGN',
    }, {
      headers: { Authorization: `Bearer ${SECRET_KEY}` },
    })
      .then(response => {
        if (response.data.status) {
          const recipientCode = response.data.data.recipient_code;
          setTransferRecipient(recipientCode);

          updateUserInDatabase(recipientCode);
          toast.success('Transfer recipient created successfully!');
        } else {
          toast.error('Failed to create transfer recipient.');
        }
      })
      .catch(error => {
        toast.error('Error creating transfer recipient: ' + error.message);
      });
  };

  // Update user data in Firestore
  const updateUserInDatabase = async (recipientCode) => {
    if (!userId) {
      console.log('No user is logged in');
      return;
    }

    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, { bank: true, transfer_recipient: recipientCode });
      toast.success('Bank details updated successfully!');
      navigate('/withdraw'); // Navigate to the "withdraw" page
    } catch (error) {
      toast.error('Error updating Firestore: ' + error.message);
    }
  };

  return (
    <div>
      <h1>Resolve Bank Account</h1>

      <label htmlFor="bank">Select Bank</label>
      <select
        id="bank"
        value={selectedBank}
        onChange={e => setSelectedBank(e.target.value)}
      >
        <option value="">-- Select Bank --</option>
        {banks.map((bank, index) => (
          <option key={`${bank.code}-${index}`} value={bank.code}>
            {bank.name}
          </option>
        ))}
      </select>

      <br />

      <label htmlFor="account-number">Account Number</label>
      <input
        type="text"
        id="account-number"
        value={accountNumber}
        onChange={e => setAccountNumber(e.target.value)}
        placeholder="Enter your account number"
      />

      <br />

      <button type="button" onClick={resolveAccount}>
        Resolve Account
      </button>

      <div>
        {accountName && (
          <>
            <p>Account Name: {accountName}</p>
            <button onClick={createTransferRecipient}>Proceed to Withdrawals</button>
          </>
        )}
      </div>

      {resolutionStatus && <p>{resolutionStatus}</p>}
      {transferRecipient && <p>Transfer Recipient Code: {transferRecipient}</p>}
    </div>
  );
};

export default BankAccountForm;
