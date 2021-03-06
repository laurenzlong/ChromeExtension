
#include "stdafx.h"
#include <string>
#include <sstream>
#include <iostream>
#include <vector>
#include <ncl.h>
#include <windows.h>
#include <fstream>

using namespace std;

FILE * pFile; // file to save stderr to
bool gNclInitialized=false;
bool normalDisconnect=false;
int gAgreementHandle;
vector<NclProvision> gProvisions; // the allowed provisions

void sendMsgToChrome (string msg, string target);
string getMsgFromChrome();
string homePath();
int saveProvisionsToFile();
int getProvisionsFromFile();


void callback(NclEvent event, void* userData){

	string led_pattern = "";
    switch(event.type){
        case NCL_EVENT_INIT:
			sendMsgToChrome("ncl-done-init", "extension");
            if(event.outcome.success) gNclInitialized=true;
            else exit(-1);
            break;
        case NCL_EVENT_DISCOVERY:
			sendMsgToChrome("NCL_EVENT_DISCOVERY passed to callback", "console");
            sendMsgToChrome("Nymi discovered", "console");
            sendMsgToChrome("Stopping scan", "console");
            nclStopScan();
            sendMsgToChrome("Agreeing", "console");
            nclAgree(event.discovery.nymiHandle);
            break;
        case NCL_EVENT_AGREEMENT:
			sendMsgToChrome("NCL_EVENT_AGREEMENT passed to callback", "console");
            gAgreementHandle=event.agreement.nymiHandle;
            sendMsgToChrome("Is this: ", "console");
            for(unsigned i=0; i<NCL_LEDS; ++i){
				string led_char = event.agreement.leds[i]?"1":"0";
                led_pattern = led_pattern + " "+ led_char;
			}
			sendMsgToChrome("PATTERN " + led_pattern, "extension");
            break;
        case NCL_EVENT_PROVISION:
			sendMsgToChrome("NCL_EVENT_PROVISION passed to callback", "console");
            gProvisions.push_back(event.provision.provision);
			saveProvisionsToFile();
            sendMsgToChrome("provision-done", "extension");
            break;
        case NCL_EVENT_DISCONNECTION:
			sendMsgToChrome("NCL_EVENT_DISCONNECTION passed to callback", "console");
            sendMsgToChrome("disconnected", "console");
			nclLockErrorStream();
			fprintf(pFile, "disconnect reason: %d\n", event.disconnection.reason);
			fflush(pFile);
			nclUnlockErrorStream();
			if (!normalDisconnect)
				sendMsgToChrome("unexpected-disconnect","extension");
			normalDisconnect = false;
            break;
        case NCL_EVENT_FIND:
			sendMsgToChrome("NCL_EVENT_FIND passed to callback", "console");
            sendMsgToChrome("Nymi found", "console");
            sendMsgToChrome("Stopping scan", "console");
            nclStopScan();
            sendMsgToChrome("Validating the Nymi...", "console");
            nclValidate(event.find.nymiHandle);
			gAgreementHandle = event.find.nymiHandle;
            break;
        case NCL_EVENT_VALIDATION:
			sendMsgToChrome("NCL_EVENT_VALIDATION passed to callback", "console");
            sendMsgToChrome("VALIDATED", "extension");
			break;
		case NCL_EVENT_SCAN_START:
			sendMsgToChrome("NCL_EVENT_SCAN_START passed to callback", "console");
			sendMsgToChrome((event.outcome.success?"success":"failure"), "console");
            break;
        default: break;
    }
}

void sendMsgToChrome (string msg, string target){
	string message = "{\"target\": \"" + target + "\", \"text\": \"" + msg + "\"}";

	unsigned int len = message.length();
    // We need to send the 4 bytes of length information
    cout << char(((len>>0) & 0xFF))
              << char(((len>>8) & 0xFF))
              << char(((len>>16) & 0xFF))
              << char(((len>>24) & 0xFF));
    // Now we can output our message
    cout << message;
}

string getMsgFromChrome(){
	unsigned int c, i, t=0;
    string inp;  

        inp="";
        t=0;
        // Sum the first 4 chars from stdin (the length of the message passed).
        for (i = 0; i <= 3; i++) {
            t += getchar();
        }

        // Loop getchar to pull in the message until we reach the total
        //  length provided.
		
        for (i=0; i < t; i++) {
            c = getchar();
            if(c == EOF)
            {
                i = t;
            }
            else
            {
                inp += c;
            }
        }

	sendMsgToChrome("native app got message: "+ inp, "console");
	return inp;
}

string homePath(){
	//returns the path for where provisions and error log are saved
	return "W:\\ChromeExtension\\";
}


int saveProvisionsToFile(){
	ofstream file((homePath()+"provisions.txt").c_str());
	file<<gProvisions.size()<<"\n";
	for(unsigned i=0; i<gProvisions.size(); ++i){
		for(unsigned j=0; j<NCL_PROVISION_KEY_SIZE; ++j) file<<(int)gProvisions[i].key[j]<<" ";
		file<<" ";
		for(unsigned j=0; j<NCL_PROVISION_ID_SIZE; ++j) file<<(int)gProvisions[i].id[j]<<" ";
		file<<"\n";
	}
	file.close();
	return 0;
}

int getProvisionsFromFile(){
	ifstream file((homePath()+"provisions.txt").c_str());
	if(file.good()){
		sendMsgToChrome("Getting previously stored devices", "console");
		unsigned size;
		file>>size;
		for(unsigned i=0; i<size; ++i){
			gProvisions.push_back(NclProvision());
			for(unsigned j=0; j<NCL_PROVISION_KEY_SIZE; ++j){
				unsigned b;
				file>>b;
				gProvisions.back().key[j]=b;
			}
			for(unsigned j=0; j<NCL_PROVISION_ID_SIZE; ++j){
				unsigned b;
				file>>b;
				gProvisions.back().id[j]=b;
			}
		}
		return 0;
	}
	else
		return 1;
}


int _tmain(int argc, _TCHAR* argv[])
{
	cout.setf( ios_base::unitbuf ); //instead of "<< eof" and "flushall", necessary for sending messages to chrome

	pFile = fopen ((homePath()+"error.txt").c_str(), "w");
	if(!nclInit(callback, NULL, "Chrome", NCL_FALSE, pFile)){
		sendMsgToChrome("The Nymi Communication Library failed to run", "console");
		sendMsgToChrome("ncl-run-fail", "extension");
		return -1;
	}

	//if (getProvisionsFromFile() == 1)
	//	sendMsgToChrome("did not find stored provisions", "console");


	while(true){
       string input = getMsgFromChrome();

       if(!gNclInitialized){
           sendMsgToChrome("ncl-not-initialized", "console");
           continue;
       }
       else if(input=="\"setup\""){
           sendMsgToChrome("starting discovery", "console");
		   normalDisconnect = true;
		   nclDisconnect(0);
           NclBool result = nclStartDiscovery();
		   sendMsgToChrome(" done discovery", "console");
       }
       else if(input=="\"agree\""){
           sendMsgToChrome("provisioning", "console");
           nclProvision(gAgreementHandle);
		   normalDisconnect = true;
		   sendMsgToChrome("done provisioning", "console");
       }
       else if(input=="\"reject\""){
           sendMsgToChrome("disconnecting", "console");
		   normalDisconnect = true;
           nclDisconnect(0);
		   sendMsgToChrome("done disconnecting", "console");
		   nclStartDiscovery(); //restart discovery
       }
       else if(input=="\"validate\""){
           sendMsgToChrome("starting finding", "console");
           nclStartFinding(gProvisions.data(), gProvisions.size());
		   sendMsgToChrome("done finding", "console");
       }
	   else if(input=="\"getprovisions\""){
		   sendMsgToChrome("got command  to get provisions", "console");
		   if (getProvisionsFromFile() == 1)
			   sendMsgToChrome("no-saved-provisions","extension");
		   else
			   sendMsgToChrome("found-saved-provisions","extension");
	   }
	   else if(input=="\"disconnect\""){
		   normalDisconnect = true;
		   nclDisconnect(0);
	   }
       else if(input=="\"quit\""){ 
		   normalDisconnect = true;
		   break;
	   }
	   else{
		   sendMsgToChrome("invalid input received from chrome!!", "console");
		   continue;
	   }
   }
   //finish

   nclFinish();
   fclose(pFile);

	return 0;

}

