import WindowFrame from "../WindowFrame/WindowFrame.mjs";

export default class FeedbackWindow{
  constructor(){
    this.Questions = {};
    const Window = new WindowFrame(900, 400);
    Window.SetTitle("Feedback");
    Window.SetPosition(100, 100);

    const Wrapper = document.createElement("div");
    Wrapper.style.paddingInline = "50px";
    Wrapper.style.paddingBlock = "15px";
    Wrapper.style.fontSize = "16px";
    Wrapper.append(document.createTextNode("Thank you for taking part in this study. If you have any questions or concerns, please contact Luka Senic at 2619426s@student.gla.ac.uk."));
    Wrapper.append(document.createElement("br"));
    Wrapper.append(document.createTextNode("By taking part in this study, you confirm that the answers you provide in this form may be used in a fourth year disseartation project. By taking part in this study, you also confirm that you were not given any incentives to complete it."));
    Wrapper.append(document.createElement("br"));
    Wrapper.append(document.createElement("br"));
    Wrapper.append(document.createTextNode("This section of the form relates to the original version of Sigma16. If applicable, please relate these questions to your experiences when you first started using the system."));
    Wrapper.append(document.createElement("br"));
    Wrapper.append(document.createElement("br"));

    //https://www.usability.gov/how-to-and-tools/methods/system-usability-scale.html
    /*
      I think that I would like to use this system frequently.
      I found the system unnecessarily complex.
      I thought the system was easy to use.
      I think that I would need the support of a technical person to be able to use this system.
      I found the various functions in this system were well integrated.
      I thought there was too much inconsistency in this system.
      I would imagine that most people would learn to use this system very quickly.
      I found the system very cumbersome to use.
      I felt very confident using the system.
      I needed to learn a lot of things before I could get going with this system.
    */
    Wrapper.append(this.CreateNewQuestion("Original1", "I think that I would like to use this system frequently."));
    Wrapper.append(this.CreateNewQuestion("Original2", "I found the system unnecessarily complex."));
    Wrapper.append(this.CreateNewQuestion("Original3", "I thought the system was easy to use."));
    Wrapper.append(this.CreateNewQuestion("Original4", "I think that I would need the support of a technical person to be able to use this system."));
    Wrapper.append(this.CreateNewQuestion("Original5", "I found the various functions in this system were well integrated."));
    Wrapper.append(this.CreateNewQuestion("Original6", "I thought there was too much inconsistency in this system."));
    Wrapper.append(this.CreateNewQuestion("Original7", "I would imagine that most people would learn to use this system very quickly."));
    Wrapper.append(this.CreateNewQuestion("Original8", "I found the system very cumbersome to use."));
    Wrapper.append(this.CreateNewQuestion("Original9", "I felt very confident using the system."));
    Wrapper.append(this.CreateNewQuestion("Original10", "I needed to learn a lot of things before I could get going with this system."));
    
    Wrapper.append(document.createElement("br"));
    Wrapper.append(document.createElement("br"));
    Wrapper.append(document.createTextNode("This section of the form relates to this program. Without closing this form, try using this program and answer the following questions."));
    Wrapper.append(document.createElement("br"));
    Wrapper.append(document.createElement("br"));

    Wrapper.append(this.CreateNewQuestion("New1", "I think that I would like to use this system frequently."));
    Wrapper.append(this.CreateNewQuestion("New2", "I found the system unnecessarily complex."));
    Wrapper.append(this.CreateNewQuestion("New3", "I thought the system was easy to use."));
    Wrapper.append(this.CreateNewQuestion("New4", "I think that I would need the support of a technical person to be able to use this system."));
    Wrapper.append(this.CreateNewQuestion("New5", "I found the various functions in this system were well integrated."));
    Wrapper.append(this.CreateNewQuestion("New6", "I thought there was too much inconsistency in this system."));
    Wrapper.append(this.CreateNewQuestion("New7", "I would imagine that most people would learn to use this system very quickly."));
    Wrapper.append(this.CreateNewQuestion("New8", "I found the system very cumbersome to use."));
    Wrapper.append(this.CreateNewQuestion("New9", "I felt very confident using the system."));
    Wrapper.append(this.CreateNewQuestion("New10", "I needed to learn a lot of things before I could get going with this system."));
    
    Wrapper.append(document.createElement("br"));
    Wrapper.append(document.createElement("br"));
    Wrapper.append(document.createTextNode("This section of the form relates to general questions about both the Sigma16 and SigmaPlus16 IDEs and their respective features."));
    Wrapper.append(document.createElement("br"));
    Wrapper.append(document.createElement("br"));

    Wrapper.append(this.CreateNewQuestion("General1", "The Sigma16 memory and register viewer was easy to use."));
    Wrapper.append(this.CreateNewQuestion("General2", "The SigmaPlus16 memory and register viewer was easy to use."));
    Wrapper.append(this.CreateNewQuestion("General3", "Tabs in Sigma16 were easy to navigate."));
    Wrapper.append(this.CreateNewQuestion("General4", "Tabs in SigmaPlus16 were easy to navigate."));
    Wrapper.append(this.CreateNewQuestion("General5", "Windows made SigmaPlus16 easier to use."));
    Wrapper.append(this.CreateNewQuestion("General6", "The Sigma16 editor was easy to use."));
    Wrapper.append(this.CreateNewQuestion("General7", "The SigmaPlus16 editor was easy to use."));
    Wrapper.append(this.CreateNewQuestion("General8", "Sigma16 offers good debugging capabilities."));
    Wrapper.append(this.CreateNewQuestion("General9", "SigmaPlus16 offers good debugging capabilities."));
    Wrapper.append(this.CreateNewQuestion("General10", "Documentation tooltips in SigmaPlus16 were useful."));
    Wrapper.append(this.CreateNewQuestion("General11", "Using Sigma16 feels responsive."));
    Wrapper.append(this.CreateNewQuestion("General12", "Using SigmaPlus16 feels responsive."));
    

    Wrapper.append(document.createElement("br"));
    Wrapper.append(document.createTextNode("If you have any general feedback or comments, please provide them below."));
    Wrapper.append(document.createElement("br"));
    const Feedback = document.createElement("textarea");
    Feedback.style.background = "transparent";
    Feedback.style.color = "white";
    Feedback.style.outline = "none";
    Feedback.style.width = "100%";
    Feedback.style.height = "100px";
    Feedback.style.display = "block";
    Wrapper.append(Feedback);
    Feedback.addEventListener("input", function(){
      this.Questions["Feedback"] = Feedback.value;
    }.bind(this));

    Wrapper.append(document.createElement("br"));
    Wrapper.append(document.createTextNode("Thank you for taking part in this survey. Please click \"Submit\" to record your response."));
    Wrapper.append(document.createElement("br"));


    const ButtonsWrapper = document.createElement("div");
    ButtonsWrapper.style.fontSize = "16px";
    ButtonsWrapper.classList.add("ButtonsWrapper");
    const SubmitButton = document.createElement("div");
    SubmitButton.style.width = "150px";
    SubmitButton.innerText = "Submit";
    ButtonsWrapper.append(SubmitButton);

    Wrapper.append(ButtonsWrapper);

    let Submitted = false;
    const Confirmation = document.createElement("div");
    Wrapper.append(Confirmation);
    SubmitButton.addEventListener("click", function(){
      if(Submitted) return void (Confirmation.innerText = "Sorry, the form has been submitted already.");
      Submitted = true;
      console.log(this.Questions);
      Confirmation.innerText = "Form is submitting...";

      window.fetch("/SubmitForm", {
        method: "POST",
        headers: {'Content-Type': 'application/json'}, 
        body: JSON.stringify(this.Questions)
      }).then(async function(res){
        Confirmation.innerText = "The form has been submitted. If you want to withdraw from the study, please email me at 2619426s@student.gla.ac.uk before March 21st, and provide the following number: " + (await res.text()) + ". Thank you for your participation!";
      });
    }.bind(this));
    
    Window.BodyElement.append(Wrapper);
  }
  CreateNewQuestion(ID, QuestionText){
    const Question = document.createElement("div");
    
    const Text = document.createElement("div");
    Text.innerText = QuestionText;
    Text.style.fontSize = "16px";
    Text.style.marginBlock = "10px";
    const ButtonsWrapper = document.createElement("div");
    ButtonsWrapper.style.fontSize = "16px";
    ButtonsWrapper.classList.add("ButtonsWrapper");
    const StronglyDisagree = document.createElement("div");
    StronglyDisagree.innerText = "Strongly disagree";
    StronglyDisagree.style.width = "150px";
    ButtonsWrapper.append(StronglyDisagree);
    const Disagree = document.createElement("div");
    Disagree.innerText = "Disagree";
    Disagree.style.width = "150px";
    ButtonsWrapper.append(Disagree);
    const Neutral = document.createElement("div");
    Neutral.innerText = "Neutral";
    Neutral.style.width = "150px";
    ButtonsWrapper.append(Neutral);
    const Agree = document.createElement("div");
    Agree.innerText = "Agree";
    Agree.style.width = "150px";
    ButtonsWrapper.append(Agree);
    const StronglyAgree = document.createElement("div");
    StronglyAgree.innerText = "Strongly agree";
    StronglyAgree.style.width = "150px";
    ButtonsWrapper.append(StronglyAgree);

    Question.append(Text);
    Question.append(ButtonsWrapper);

    this.Questions[ID] = null;

    function Set(SelectedElement){
      for(const Element of [
        StronglyDisagree,
        Disagree,
        Neutral,
        Agree,
        StronglyAgree
      ]) Element.style.filter = "";
      SelectedElement.style.filter = "brightness(200%)";
    }
    for(const Element of [
      StronglyDisagree,
      Disagree,
      Neutral,
      Agree,
      StronglyAgree
    ]){
      Element.addEventListener("click", function(){
        this.Questions[ID] = Element.innerText;
        Set(Element);
      }.bind(this));
    }

    return Question;
  }
};