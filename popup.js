// Copyright 2023 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// Event listner for clicks on links in a browser action popup.
// Open the link in a new tab of the current window.


function onAnchorClick(event)
{
  chrome.tabs.create({
    selected: true,
    url: event.srcElement.href
  });
  return false;
}

// Given an array of URLs, build a DOM list of those URLs in the
// browser action popup.
function buildPopupDom(divName, data)
{
  let popupDiv = document.getElementById(divName);

  let ul = document.createElement('ul');
  popupDiv.appendChild(ul);

  for (let i = 0, ie = data.length; i < ie; ++i)
  {
    let a = document.createElement('a');
    a.href = data[i];
    a.appendChild(document.createTextNode(data[i]));
    a.addEventListener('click', onAnchorClick);

    let li = document.createElement('li');
    li.appendChild(a);

    ul.appendChild(li);
  }
}



// Search history to find up to ten links that a user has typed in,
// and show those links in a popup.
function buildTypedUrlList(divName)
{


  //  AV - change adding more days.

  // To look for history items visited in the last week,
  // subtract a week of microseconds from the current time.
  let microsecondsPerWeek = 1000 * 60 * 60 * 24 * 7 * 4 * 3;



  let oneWeekAgo = new Date().getTime() - microsecondsPerWeek;

  // Track the number of callbacks from chrome.history.getVisits()
  // that we expect to get.  When it reaches zero, we have all results.
  let url_array = [];

  chrome.history.search(
    {
      text: '', // Return every history item....
      startTime: oneWeekAgo, // that was accessed less than one week ago.
      maxResults: 5000

    },
    async function (historyItems)
    {
      // console.log(historyItems);
      // For each history item, get details on all visits.
      for (let i = 0; i < historyItems.length; ++i)
      {
        let url = historyItems[i].url;
        // console.log(url);

        // async function x()
        // {
        //   a = await chrome.history.getVisits({ url: url })
        //   console.log(url);

        //   console.log(a);

        // }
        // x()

        try
        {
          // AV change - Adding domains instead of webpages.
          url_object = new URL(url);
          // url = url_object.protocol + "//" + url_object.hostname;
          url = url_object.hostname;

          // console.log(url);
        }
        catch (err)
        {
          // url = historyItems[i].url;
          console.log(err);
          console.log(url);
        }
        url_array.push(url)

      }
      // console.log("+++++++++++++++++");
      // console.log(url_array);






      // From https://www.geeksforgeeks.org/count-occurrences-of-all-items-in-an-array-in-javascript/#approach-3-using-filter-method
      const count = {};

      for (let ele of url_array)
      {
        if (count[ele])
        {
          count[ele] += 1;
        } else
        {
          count[ele] = 1;
        }
      }
      // console.log(count);

      let entries = Object.entries(count);
      // [["you",100],["me",75],["foo",116],["bar",15]]

      let sorted = entries.sort((a, b) => b[1] - a[1]);
      // console.log(sorted);


      var gogglesText = `! name: Googles for ${document.querySelector("#email").value}
! description: Rerank results in brave search based on browsing history..
! public: false
! author: Auto Goggles
! avatar: #de0320
! for: ${document.querySelector("#email").value}

`

      var not_searchable = ['','google.com', "search.brave.com", "gmail.com", "mail.proton.me", "www.google.com"]
      // var gogglesText=""
      for (let i in sorted)
      {
        // For blacklist
        if (!(not_searchable.includes(sorted[i][0])))
        {
          gogglesText += `$site=${sorted[i][0]},boost=9
`
        }
        else
        {
          console.log(sorted[i][0] + " is not_searchable");
        }
      }

      gogglesText = gogglesText.replace(/(\r\n|\r|\n)/g, '\\n');
      // Creating gist 
      async function a()
      {
        gist_res = await fetch('https://api.github.com/gists', {
          method: 'POST',
          headers: {
            'Accept': 'application/vnd.github+json',
            'Authorization': 'Bearer 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',
            'X-GitHub-Api-Version': '2022-11-28',
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: '{"description":"Testing gist","public":false,"files":{"goggles-creator.googles":{"content":  "' + gogglesText + '" }  }}'
        });

        b = await gist_res.json()
        // console.log(b);
        gist_url = Object.values(b.files)[0]['raw_url']
        return gist_url
      }
      gist_url = await a()
console.log(gist_url);

      // Adding googles to Brave index.
      // var u = "https://search.brave.com/api/goggles/submit?url=https%3A%2F%2Fgist.githubusercontent.com%2Fnamelessperson0%2Fe1914bc445d4f73e24a9bd834871bcda%2Fraw%2F8de485e6180eae4135ea60c41f541baee244464e%2Fgoggles-creator.googles"
      // var u = "https%3A%2F%2Fsearch.brave.com%2Fapi%2Fgoggles%2Fsubmit%3Furl%3Dhttps%253A%252F%252Fgist.githubusercontent.com%252Fnamelessperson0%252Fe1914bc445d4f73e24a9bd834871bcda%252Fraw%252F8de485e6180eae4135ea60c41f541baee244464e%252Fgoggles-creator.googles%22"

      var u = "https://search.brave.com/api/goggles/submit?url="+gist_url
      const url = u

      let res = await fetch(url, {
        "headers": {
          "accept": "*/*",
          "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
          // "cache-control": "no-cache",
          // "pragma": "no-cache",
          // "sec-fetch-dest": "empty",
          // "sec-fetch-mode": "cors",
          // "sec-fetch-site": "same-origin",
          // "sec-gpc": "1"
        },
        // "referrerPolicy": "no-referrer",
        "body": null,
        "method": "POST",
        "mode": "cors"

      });

      let res2 = await res.json()
      console.log(res2);

      g_id = res2['goggle']['goggleID']
      console.log(g_id);
g_id = "https://search.brave.com/goggles?goggles_id="  + g_id 

document.querySelector("#a_loader").style.display="none"

document.querySelector("#new_content").style.display="block"
document.querySelector("#g_id").href=g_id
    }
  );

  // This function is called when we have the final list of URls to display.

}

document.addEventListener('DOMContentLoaded', function ()
{
});

document.querySelector("#a_submit").addEventListener("click", function ()
{
  console.log("aaa");
  document.querySelector("#content").style.display="none"
  document.querySelector("#a_loader").style.display="block"

  buildTypedUrlList('typedUrl_div');

});
