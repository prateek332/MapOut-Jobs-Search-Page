import React, { useEffect, useState } from "react";
import fetchJobs from "../../api/jobsAPI";
import Spinner from "../Spinner/Spinner";
import jobLocations from "./jobLocations";
import jobTypes from "./jobTypes";

export default function Form(props) {

  const [jobType, setJobType] = useState("");
  const [jobLocation, setJobLocation] = useState("");

  const [onGoingRequest, setOnGoingRequest] = useState(false);
  const [aborted, setAborted] = useState(false);

  const {
    setJobsData,
    // controller,
  } = {...props}

  let controller = new AbortController();

  const onFormSubmit = (e) => {

    console.log(controller.signal);
    
    if (!onGoingRequest) {
      
      setAborted(false);
      setOnGoingRequest(true);

      console.log(jobType, jobLocation);

      try {
        fetchJobs(jobType, jobLocation, controller.signal)
          .then(res => {
            setJobsData(res.jobs);
            setOnGoingRequest(false);
          })
      } catch (error) {
          setOnGoingRequest(false);
          // console.log(error)
      }
    } else {
      controller.abort();
      setAborted(true);
      setOnGoingRequest(false);
    }

  }

  const onCancel = () => {
    controller.abort();
    console.log(signal)
  }

  return (
    <div className='flex flex-wrap justify-evenly mt-20 text-gray-600'>

      <div className='w-full flex justify-center mb-8'>

        {
          jobType.length > 0 ?
            <div className='mx-10 flex flex-col justify-center p-2 border-2  border-yellow-700 rounded-full border-opacity-50'>
              {jobType}
            </div>
          :
            null
        }

        <div>
          {_jobTypeInput(setJobType)}
        </div>
      </div>

      { _jobTypeSelect(setJobType)}
      { _jobLocationSelect(setJobLocation)}
      {_submitButton(onFormSubmit, onCancel, onGoingRequest)}
    </div>
  );
}

function _jobTypeInput(setJobType) {

  const onChange = (e) => {
    setJobType(e.target.value);
  }

  return (
    <input
      onChange={e => onChange(e)}
      placeholder="Type a job or select one from the list"
      className='w-80 bg-transparent border-b-2 border-gray-400 rounded-lg p-2 outline-none'
    ></input>
  )
}


function _jobTypeSelect(setJobType) {
  return(
    <select 
      name="jobType" 
      id="jobType" 
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

function _submitButton(onFormSubmit, onCancel, onGoingRequest) {
  return (
    <button
      id="jobSearchButton"
      type="submit"
      className="search-button bg-yellow-600 hover:bg-yellow-500 "
      onClick={(e) => {
        e.preventDefault();
        onFormSubmit(e);
      }}
    >
      {
        onGoingRequest ? 
          <div className="flex justify-between">
            {_toggleSubmitButtonColor(onGoingRequest)}
            <Spinner style="border-4 border-white-200 h-8 w-8"/> Cancel
          </div>
        :
          <div>
            {_toggleSubmitButtonColor(onGoingRequest)}
            Search
          </div> 
      }

    </button>
  )
}

function _toggleSubmitButtonColor(onGoingRequest) {

  let button = document.getElementById("jobSearchButton");

  if (button){
    if (onGoingRequest) {
      button.classList.remove("bg-yellow-600");
      button.classList.remove("hover:bg-yellow-500");
      button.classList.add("bg-red-500");
      button.classList.add("hover:bg-red-400");
    } else {
      button.classList.remove("bg-red-500");
      button.classList.remove("hover:bg-red-400");
      button.classList.add("bg-yellow-600");
      button.classList.add("hover:bg-yellow-500");
    }
  }
}