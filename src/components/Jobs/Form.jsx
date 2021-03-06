import React, { useContext, useState } from "react";
import fetchJobs from "../../api/jobsAPI";
import Spinner from "../Spinner/Spinner";
import { JobsContext } from "./FindJobs";
import jobLocations from "./jobLocations";
import jobTypes from "./jobTypes";


export default function Form(props) {

  const [jobType, setJobType] = useState("");
  const [jobLocation, setJobLocation] = useState("");

  // state to save fetch controller to cancel ongoing fetch requests
  const [fetchController, setFetchController] = useState(null);

  const [errorMessage, setErrorMessage] = useState(null);
  const serverErrorMessage = `Error at server, please try again later`;

  const {
    setJobsData,
    onGoingRequest,
    setOnGoingRequest,
  } = useContext(JobsContext);


  const onFormSubmit = (e) => {
    // fetch request controller to abort ongoing fetch requests
    let controller = new AbortController();
    setFetchController(controller);
    setErrorMessage(null);
    
    if (jobType !== "" && jobLocation !== "") {
      if (!onGoingRequest) {
        setOnGoingRequest(true);
        try {
          fetchJobs(jobType, jobLocation, controller.signal)
            .then(res => {
              if (res.jobs.length === 0) {
                setErrorMessage("No jobs available for the given input");
              } else {
                setJobsData(res.jobs);
              }
            })
            .catch(err => {
              if (err.name === 'AbortError') {
                console.log('Request aborted');
              } else {
                console.log(err);
                setErrorMessage(serverErrorMessage);
                setJobsData([]);
                
              }
            })
            .finally (() => {
              setOnGoingRequest(false);
            })
        } catch (error) {
            setErrorMessage(serverErrorMessage);
            setJobsData([]);
            setOnGoingRequest(false);
        }
      } else {
        fetchController.abort();
        setOnGoingRequest(false);
      }
    } else {
      setErrorMessage("Please select a Location and select or type a Job");
    }
  }

  return (
    <div className='flex flex-wrap justify-evenly mt-20 text-gray-600'>

      <div className='w-full flex flex-wrap justify-center mb-8'>
        {
          jobType.length > 0 ?
            <div className='mx-10 flex flex-col justify-center p-2 border-2  border-yellow-700 rounded-full border-opacity-50'>
              {jobType}
            </div>
          :
            null
        }

        <div>
          {_jobTypeInput(setJobType, onGoingRequest)}
        </div>

      </div>
      
      <div className='flex flex-wrap justify-center space-x-5 space-y-3'>
        { _jobTypeSelect(setJobType)}
        { _jobLocationSelect(setJobLocation)}
        {_submitButton(onFormSubmit, onGoingRequest)}
      </div>
      
      {
        errorMessage ?
          <div className='flex flex-wrap w-full justify-center mt-20 text-red-500 text-xl transition duration-400 ease-in animate-bounce'>
            {errorMessage}
          </div>
        :
          null
      }
      
      {_disableInputs(onGoingRequest)}

    </div>
  );
}

// Input box for entering job manually
function _jobTypeInput(setJobType, onGoingRequest) {
  const onChange = (e) => {
    setJobType(e.target.value);
  }
  return (
    <input
      id="jobInputBox"
      onChange={e => onChange(e)}
      placeholder="Type a job or select one from the list"
      className="w-80 bg-transparent border-b-2 border-gray-400 rounded-lg p-2 outline-none"
    ></input>
  )
}

// Dropdown to select job
function _jobTypeSelect(setJobType) {
  return(
    <select 
      id="jobType" 
      name="jobType"
      onChange={e => setJobType(e.target.value)}
      className="select-box"
    >
      <option selected className='hidden'>Job Type</option>

      {
        jobTypes.map(jobType => 
        <option 
          key={jobType}
        >
            {jobType}
        </option>) 
      }
    </select>
  )
}

// Dropdown to select job location
function _jobLocationSelect(setJobLocation) {
  return (
    <select 
      id="jobLocation"
      name="jobLocation" 
      onChange={e => setJobLocation(e.target.value)}
      className="select-box"
    >
      <option selected className='hidden'>Job Location</option>

      { 
        jobLocations.map(jobLocation => 
          <option 
            key={jobLocation}
          >
            {jobLocation}
          </option>) 
      }
    </select>
  )
}

// Search button to search for job. This button turns into a
// Cancel button when a fetch request is ongoing
function _submitButton(onFormSubmit, onGoingRequest) {

  let buttonStyle;

  onGoingRequest ?
    buttonStyle = `bg-red-500 hover:bg-red-400`
  :
    buttonStyle = `bg-yellow-600 hover:bg-yellow-500`

  return (
    <button
      id="jobSearchButton"
      type="submit"
      className={`search-button ${buttonStyle}`}
      onClick={(e) => {
        e.preventDefault();
        onFormSubmit(e);
      }}
    >
      {
        onGoingRequest ? 
          <div className="flex justify-between items-center">           
            <Spinner style="border-4 h-6 w-6 mr-2"/> 
            Cancel
          </div>
        :
          <div>
            Search
          </div> 
      }

    </button>
  )
}


// Utility function to disable input fields when a fetch request is ongoing
function _disableInputs(onGoingRequest) {

  let jobInputBox = document.getElementById("jobInputBox");
  let jobType = document.getElementById("jobType");
  let jobLocation = document.getElementById("jobLocation");

  if (onGoingRequest && jobInputBox) {
    jobInputBox.disabled = true;
    jobType.disabled = true;
    jobLocation.disabled = true;
  }

  if (!onGoingRequest && jobInputBox) {
    jobInputBox.disabled = false;
    jobType.disabled = false;
    jobLocation.disabled = false;
  }

}